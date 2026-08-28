"""User management and pre-seeded demo clinicians for PatientTriage.ai"""
from typing import Dict, List, Optional
from datetime import datetime, timezone
from auth.jwt_handler import hash_password, verify_password

# In-memory user database initialized with pre-seeded clinical staff
USERS_DB: Dict[str, dict] = {}


def _init_default_clinicians():
    """Seed default clinical users with pre-hashed passwords."""
    default_users = [
        {
            "id": "DOC-001",
            "email": "rohit.sharma@metro.health",
            "password": "Emergency123!",
            "name": "Dr. Rohit Sharma, MD",
            "role": "Lead Emergency Physician",
            "hospital": "Metro Trauma Center",
            "specialty": "Resuscitation & Critical Care",
            "avatar": "/doctors/dr_rohit_sharma.jpg",
            "is_physician": True,
            "badge": "Senior Attending"
        },
        {
            "id": "RN-002",
            "email": "sarah.jenkins@metro.health",
            "password": "Nurse123!",
            "name": "RN-Sarah Jenkins",
            "role": "Triage Charge Nurse",
            "hospital": "Metro General ED",
            "specialty": "Emergency Intake & Stratification",
            "avatar": "/doctors/nurse_sarah.jpg",
            "is_physician": False,
            "badge": "Triage Lead"
        },
        {
            "id": "DOC-003",
            "email": "priya.nair@apollo.health",
            "password": "Chief123!",
            "name": "Dr. Priya Nair, MD, FACS",
            "role": "Chief of Emergency Medicine",
            "hospital": "Apollo Medical Institute",
            "specialty": "Clinical Governance & ESI Triage",
            "avatar": "/doctors/dr_priya_nair.jpg",
            "is_physician": True,
            "badge": "Clinical Lead"
        },
        {
            "id": "DOC-004",
            "email": "ananya.patel@aiims.health",
            "password": "Fellow123!",
            "name": "Dr. Ananya Patel, MD",
            "role": "Emergency AI Fellow",
            "hospital": "AIIMS New Delhi",
            "specialty": "Multimodal Clinical Decision Support",
            "avatar": "/doctors/dr_ananya_patel.jpg",
            "is_physician": True,
            "badge": "AI Research"
        },
        {
            "id": "ADMIN-001",
            "email": "admin@patienttriage.ai",
            "password": "Admin123!",
            "name": "Clinical Administrator",
            "role": "Chief Medical Informatics Officer",
            "hospital": "Global Medical Network",
            "specialty": "System Governance & Audit Oversight",
            "avatar": "/doctors/dr_marcus_vance.jpg",
            "is_physician": True,
            "badge": "CMIO"
        }
    ]

    for user_data in default_users:
        email = user_data["email"].lower().strip()
        pwd_hash, salt = hash_password(user_data["password"])
        USERS_DB[email] = {
            "id": user_data["id"],
            "email": email,
            "password_hash": pwd_hash,
            "salt": salt,
            "name": user_data["name"],
            "role": user_data["role"],
            "hospital": user_data["hospital"],
            "specialty": user_data["specialty"],
            "avatar": user_data["avatar"],
            "is_physician": user_data["is_physician"],
            "badge": user_data["badge"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }


# Initialize seed data
_init_default_clinicians()


def get_user_by_email(email: str) -> Optional[dict]:
    """Retrieve user dictionary by email."""
    return USERS_DB.get(email.lower().strip())


def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Validate credentials and return user profile (without sensitive hash/salt)."""
    user = get_user_by_email(email)
    if not user:
        return None
    
    if not verify_password(password, user["password_hash"], user["salt"]):
        return None
    
    # Return safe user profile
    return get_safe_user_profile(user)


def register_user(
    email: str,
    password: str,
    name: str,
    role: str = "Emergency Clinician",
    hospital: str = "Metro Trauma Center",
    specialty: str = "Emergency Medicine",
    avatar: str = "/doctors/dr_rohit_sharma.jpg",
    is_physician: bool = True,
    badge: str = "Staff Clinician"
) -> dict:
    """Register a new clinical user."""
    email_clean = email.lower().strip()
    if email_clean in USERS_DB:
        raise ValueError("A clinician with this email is already registered")
    
    pwd_hash, salt = hash_password(password)
    user_id = f"CLIN-{len(USERS_DB) + 101}"
    
    user_record = {
        "id": user_id,
        "email": email_clean,
        "password_hash": pwd_hash,
        "salt": salt,
        "name": name,
        "role": role,
        "hospital": hospital,
        "specialty": specialty,
        "avatar": avatar,
        "is_physician": is_physician,
        "badge": badge,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    USERS_DB[email_clean] = user_record
    return get_safe_user_profile(user_record)


def get_safe_user_profile(user: dict) -> dict:
    """Strip password_hash and salt from user dictionary."""
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "hospital": user["hospital"],
        "specialty": user["specialty"],
        "avatar": user["avatar"],
        "is_physician": user.get("is_physician", True),
        "badge": user.get("badge", "Clinician"),
        "created_at": user.get("created_at")
    }


def get_demo_users() -> List[dict]:
    """Return pre-seeded demo user profiles with passwords for 1-click hackathon test login."""
    return [
        {
            "email": "rohit.sharma@metro.health",
            "password": "Emergency123!",
            "name": "Dr. Rohit Sharma, MD",
            "role": "Lead Emergency Physician",
            "badge": "Senior Attending",
            "avatar": "/doctors/dr_rohit_sharma.jpg"
        },
        {
            "email": "sarah.jenkins@metro.health",
            "password": "Nurse123!",
            "name": "RN-Sarah Jenkins",
            "role": "Triage Charge Nurse",
            "badge": "Triage Lead",
            "avatar": "/doctors/nurse_sarah.jpg"
        },
        {
            "email": "priya.nair@apollo.health",
            "password": "Chief123!",
            "name": "Dr. Priya Nair, MD",
            "role": "Chief of Emergency Medicine",
            "badge": "Clinical Lead",
            "avatar": "/doctors/dr_priya_nair.jpg"
        }
    ]
