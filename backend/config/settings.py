"""Global configuration for PatientTriage.ai"""
from dataclasses import dataclass, field
from typing import Dict

@dataclass
class HospitalProfile:
    name: str
    daily_volume: int
    nurses_on_shift: int
    physicians_on_shift: int
    specialty_mix: str
    surge_multiplier: float = 3.0
    has_trauma_center: bool = False
    has_pediatric_unit: bool = False
    system_integration: str = 'full_emr'

LARGE_URBAN_TRAUMA = HospitalProfile(
    name='Metro General Hospital - Level I Trauma Center',
    daily_volume=400, nurses_on_shift=8, physicians_on_shift=4,
    specialty_mix='Full (Trauma, Peds, OB, Cardiac, Neuro)',
    has_trauma_center=True, has_pediatric_unit=True,
    system_integration='full_emr'
)

SMALL_RURAL_ED = HospitalProfile(
    name='Valley Community Hospital - Rural ED',
    daily_volume=80, nurses_on_shift=2, physicians_on_shift=1,
    specialty_mix='General Emergency Only',
    system_integration='basic_vitals_only'
)

PROFILES = {'large_urban': LARGE_URBAN_TRAUMA, 'small_rural': SMALL_RURAL_ED}

# ESI safe wait time thresholds (minutes)
ESI_WAIT_THRESHOLDS = {1: 0, 2: 10, 3: 30, 4: 60, 5: 120}

# Pipeline settings
CONFIDENCE_THRESHOLD = 0.70
ASYMMETRIC_PENALTY = 20.0
PIPELINE_VERSION = '2.0.0'
REGULATORY_JURISDICTION = 'HIPAA (US)'

# Active profile (mutable)
active_profile = LARGE_URBAN_TRAUMA

def set_profile(name: str):
    global active_profile
    active_profile = PROFILES[name]

def get_profile() -> HospitalProfile:
    return active_profile
