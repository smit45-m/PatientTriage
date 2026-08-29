"""PatientTriage.ai — FastAPI Backend Server v2.0 with JWT Authentication"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from data.patients import get_all_patients, get_patient_by_id
from agents.graph import run_triage
from monitoring.waiting_room import WaitingRoomMonitor
from monitoring.surge_detector import SurgeDetector
from audit.logger import AuditLogger
from audit.override_handler import OverrideHandler
from config.settings import (
    get_profile, set_profile, PROFILES,
    ESI_WAIT_THRESHOLDS, PIPELINE_VERSION,
)
from auth.jwt_handler import create_access_token, get_current_user, get_current_user_optional
from auth.users import authenticate_user, register_user, get_user_by_email, get_safe_user_profile, get_demo_users

app = FastAPI(
    title="PatientTriage.ai API",
    description="AI-Powered Emergency Department Triage Assistant with JWT Authentication",
    version=PIPELINE_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize shared services
waiting_room = WaitingRoomMonitor(ESI_WAIT_THRESHOLDS)
surge_detector = SurgeDetector(baseline_rate=get_profile().daily_volume / 24)
audit_logger = AuditLogger()
override_handler = OverrideHandler(audit_logger)


# ── Pydantic Request Models ──────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "Emergency Clinician"
    hospital: Optional[str] = "Metro Level I Trauma Center"
    specialty: Optional[str] = "Emergency Medicine"
    avatar: Optional[str] = "/doctors/dr_rohit_sharma.jpg"
    badge: Optional[str] = "Staff Clinician"

class PatientIdRequest(BaseModel):
    patient_id: str

class OverrideRequest(BaseModel):
    patient_id: str
    original_esi: int
    new_esi: int
    reason: str
    nurse_id: str

class WaitingRoomAddRequest(BaseModel):
    patient_id: str
    name: str
    esi_level: int

class ConfirmRouteRequest(BaseModel):
    patient_id: str
    name: str = "Unknown"
    final_esi: int = 3
    target_bay: str = "Emergency Ward"
    nurse_id: str = "RN-Triage"

class ConfigProfileRequest(BaseModel):
    profile: str


# ── Authentication Endpoints (JWT) ───────────────────────────────────

@app.post("/api/auth/login")
def login(req: LoginRequest):
    """Authenticate clinician credentials and issue a signed JWT access token."""
    user = authenticate_user(req.email, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/staff ID or password"
        )
    
    token_payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "hospital": user["hospital"],
        "badge": user["badge"],
        "avatar": user["avatar"]
    }
    access_token = create_access_token(token_payload)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.post("/api/auth/register")
def register(req: RegisterRequest):
    """Register a new emergency clinician and return their JWT access token."""
    try:
        user = register_user(
            email=req.email,
            password=req.password,
            name=req.name,
            role=req.role or "Emergency Clinician",
            hospital=req.hospital or "Metro Trauma Center",
            specialty=req.specialty or "Emergency Medicine",
            avatar=req.avatar or "/doctors/dr_rohit_sharma.jpg",
            badge=req.badge or "Staff Clinician"
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    token_payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "hospital": user["hospital"],
        "badge": user["badge"],
        "avatar": user["avatar"]
    }
    access_token = create_access_token(token_payload)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@app.get("/api/auth/me")
def get_current_user_profile(user_payload: dict = Depends(get_current_user)):
    """Return the profile of the authenticated clinician extracted from the JWT token."""
    user_record = get_user_by_email(user_payload.get("email", ""))
    if user_record:
        return {"user": get_safe_user_profile(user_record)}
    return {"user": user_payload}


@app.get("/api/auth/demo-users")
def list_demo_users():
    """Return pre-seeded demo clinical profiles for 1-click test login."""
    return {"demo_users": get_demo_users()}


# ── Patient & Triage Endpoints ────────────────────────────────────────

@app.get("/api/patients")
def list_patients():
    return get_all_patients()

@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    p = get_patient_by_id(patient_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return p

@app.post("/api/triage")
def triage_patient(req: PatientIdRequest):
    patient = get_patient_by_id(req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {req.patient_id} not found")
    result = run_triage(patient)
    if "audit_entry" in result:
        audit_logger.log_triage(result["audit_entry"])
    return result

@app.post("/api/triage/custom")
def triage_custom_patient(patient: Dict[str, Any]):
    if "patient_id" not in patient:
        patient["patient_id"] = f"CUSTOM-{datetime.now(timezone.utc).strftime('%H%M%S')}"
    result = run_triage(patient)
    if "audit_entry" in result:
        audit_logger.log_triage(result["audit_entry"])
    return result

@app.post("/api/triage/confirm")
@app.post("/api/confirm")
def confirm_route(req: ConfirmRouteRequest):
    """Confirm patient triage acuity and route them to their designated bay."""
    waiting_room.remove_patient(req.patient_id)
    audit_logger.log_triage({
        "event_id": f"ROUTE-{datetime.now(timezone.utc).strftime('%H%M%S')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "patient_id": req.patient_id,
        "name": req.name,
        "final_esi": req.final_esi,
        "action_type": "CONFIRM_ROUTE",
        "routing": req.target_bay,
        "nurse_id": req.nurse_id
    })
    return {
        "status": "routed",
        "patient_id": req.patient_id,
        "target_bay": req.target_bay,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ── Safety & Override Endpoints ──────────────────────────────────────

@app.post("/api/override")
def override_triage(req: OverrideRequest):
    return override_handler.process_override(
        req.patient_id, req.original_esi, req.new_esi, req.reason, req.nurse_id
    )


# ── Audit Log Endpoints ──────────────────────────────────────────────

@app.get("/api/audit")
def get_audit_logs():
    return audit_logger.get_all_logs()

@app.get("/api/audit/{patient_id}")
def get_patient_audit_logs(patient_id: str):
    return audit_logger.get_patient_logs(patient_id)


# ── Waiting Room Endpoints ───────────────────────────────────────────

@app.get("/api/waiting-room")
def get_waiting_room():
    return {"queue": waiting_room.get_queue(), "stats": waiting_room.get_queue_stats()}

@app.post("/api/waiting-room/add")
def add_to_waiting_room(req: WaitingRoomAddRequest):
    waiting_room.add_patient(req.patient_id, req.name, req.esi_level, datetime.now(timezone.utc).isoformat())
    return {"status": "added", "queue_size": len(waiting_room.get_queue())}

@app.post("/api/waiting-room/remove")
def remove_from_waiting_room(req: PatientIdRequest):
    waiting_room.remove_patient(req.patient_id)
    return {"status": "removed"}

@app.get("/api/waiting-room/alerts")
def get_waiting_room_alerts():
    return waiting_room.check_alerts()


# ── Surge Endpoints ──────────────────────────────────────────────────

@app.get("/api/surge")
def get_surge_status():
    return surge_detector.get_surge_status()

@app.post("/api/surge/toggle")
def toggle_surge():
    surge_detector.manual_surge = not getattr(surge_detector, 'manual_surge', False)
    return {"is_surge": surge_detector.manual_surge, "surge_level": "ACTIVE" if surge_detector.manual_surge else "NORMAL"}


# ── Live Model Accuracy Endpoint ─────────────────────────────────────

@app.get("/api/accuracy")
def compute_accuracy():
    """Run triage on ALL patients, compare predicted vs expected ESI, return real accuracy."""
    patients = get_all_patients()
    total = len(patients)
    exact_matches = 0
    within_1 = 0
    per_patient = []
    esi_counts = {1: {"total": 0, "correct": 0}, 2: {"total": 0, "correct": 0},
                  3: {"total": 0, "correct": 0}, 4: {"total": 0, "correct": 0},
                  5: {"total": 0, "correct": 0}}
    under_triage = 0
    over_triage = 0

    for p in patients:
        expected = p.get("expected_esi", 3)
        try:
            result = run_triage(p)
            predicted = result.get("final_esi", 3)
            confidence = result.get("final_confidence", 0)
            overrides = len(result.get("safety_overrides", []))
        except Exception:
            predicted = -1
            confidence = 0
            overrides = 0

        is_exact = predicted == expected
        is_within_1 = abs(predicted - expected) <= 1
        diff = predicted - expected

        if is_exact:
            exact_matches += 1
        if is_within_1:
            within_1 += 1
        if predicted > expected:
            under_triage += 1
        if predicted < expected:
            over_triage += 1

        esi_counts[expected]["total"] += 1
        if is_exact:
            esi_counts[expected]["correct"] += 1

        per_patient.append({
            "patient_id": p["patient_id"],
            "name": p["name"],
            "age": p["age"],
            "sex": p["sex"],
            "chief_complaint": p["chief_complaint"][:80],
            "expected_esi": expected,
            "predicted_esi": predicted,
            "confidence": round(confidence, 4),
            "is_exact_match": is_exact,
            "is_within_1": is_within_1,
            "difference": diff,
            "safety_overrides": overrides,
        })

    exact_accuracy = round(exact_matches / max(total, 1) * 100, 1)
    within_1_accuracy = round(within_1 / max(total, 1) * 100, 1)
    under_triage_rate = round(under_triage / max(total, 1) * 100, 1)
    over_triage_rate = round(over_triage / max(total, 1) * 100, 1)

    per_esi_accuracy = {}
    for esi, counts in esi_counts.items():
        if counts["total"] > 0:
            per_esi_accuracy[f"ESI-{esi}"] = {
                "total": counts["total"],
                "correct": counts["correct"],
                "accuracy_pct": round(counts["correct"] / counts["total"] * 100, 1)
            }

    return {
        "total_patients": total,
        "exact_match_accuracy_pct": exact_accuracy,
        "within_1_accuracy_pct": within_1_accuracy,
        "under_triage_rate_pct": under_triage_rate,
        "over_triage_rate_pct": over_triage_rate,
        "exact_matches": exact_matches,
        "within_1_matches": within_1,
        "per_esi_accuracy": per_esi_accuracy,
        "per_patient": per_patient,
    }


# ── Config Endpoints ─────────────────────────────────────────────────

@app.get("/api/config")
def get_config():
    p = get_profile()
    return {
        "profile_name": p.name, "daily_volume": p.daily_volume,
        "nurses_on_shift": p.nurses_on_shift, "physicians_on_shift": p.physicians_on_shift,
        "specialty_mix": p.specialty_mix, "pipeline_version": PIPELINE_VERSION,
        "available_profiles": list(PROFILES.keys()),
    }

@app.post("/api/config/profile")
def update_profile(req: ConfigProfileRequest):
    if req.profile not in PROFILES:
        raise HTTPException(status_code=400, detail=f"Invalid profile. Choose from: {list(PROFILES.keys())}")
    set_profile(req.profile)
    return {"status": "success", "profile": req.profile}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
