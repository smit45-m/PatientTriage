"""PatientTriage.ai — FastAPI Backend Server v2.0"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
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

app = FastAPI(
    title="PatientTriage.ai API",
    description="AI-Powered Emergency Department Triage Assistant",
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
    routing: str = "Urgent Care"
    nurse_id: str = "RN-Sarah"

class ConfigProfileRequest(BaseModel):
    profile: str


# ── Patient Endpoints ────────────────────────────────────────────────

@app.get("/api/patients")
def get_patients():
    return get_all_patients()

@app.get("/api/patients/{patient_id}")
def get_patient(patient_id: str):
    patient = get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return patient


# ── Triage Endpoints ─────────────────────────────────────────────────

@app.post("/api/triage")
def run_triage_endpoint(req: PatientIdRequest):
    patient = get_patient_by_id(req.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {req.patient_id} not found")
    result = run_triage(patient)
    if "audit_entry" in result:
        audit_logger.log_triage(result["audit_entry"])
    surge_detector.record_arrival()
    return result

@app.post("/api/triage/custom")
def run_custom_triage(patient: Dict[str, Any]):
    result = run_triage(patient)
    if "audit_entry" in result:
        audit_logger.log_triage(result["audit_entry"])
    return result

@app.post("/api/triage/confirm")
@app.post("/api/confirm")
def confirm_route_endpoint(req: ConfirmRouteRequest):
    # Add patient to waiting room queue with current timestamp
    waiting_room.add_patient(
        patient_id=req.patient_id,
        name=req.name,
        esi_level=req.final_esi,
        arrival_time=datetime.now(timezone.utc).isoformat()
    )
    # Log confirm action in audit trail
    audit_logger.log_triage({
        "event_id": f"evt-conf-{int(datetime.now(timezone.utc).timestamp())}",
        "patient_id": req.patient_id,
        "name": req.name,
        "nurse_id": req.nurse_id,
        "final_esi": req.final_esi,
        "routing": req.routing,
        "action_type": "CONFIRM_AND_ROUTE",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return {
        "status": "confirmed",
        "patient_id": req.patient_id,
        "routing": req.routing,
        "final_esi": req.final_esi,
        "message": f"Patient {req.patient_id} successfully confirmed and routed to {req.routing}"
    }


# ── Override Endpoints ───────────────────────────────────────────────

@app.post("/api/override")
def submit_override(req: OverrideRequest):
    result = override_handler.process_override(
        patient_id=req.patient_id,
        original_esi=req.original_esi,
        new_esi=req.new_esi,
        reason=req.reason,
        nurse_id=req.nurse_id,
    )
    return result


# ── Audit Endpoints ──────────────────────────────────────────────────

@app.get("/api/audit")
def get_all_audit_logs():
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
