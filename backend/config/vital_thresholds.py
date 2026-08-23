"""Age-stratified vital sign thresholds for PatientTriage.ai"""
from dataclasses import dataclass
from typing import Dict

@dataclass
class VitalThresholds:
    hr_high: int
    hr_low: int
    sbp_low: int
    spo2_low: int
    temp_high: float
    rr_high: int
    rr_low: int
    map_low: int
    shock_index_critical: float
    mews_critical: int

PEDIATRIC = VitalThresholds(hr_high=180, hr_low=60, sbp_low=70, spo2_low=92, temp_high=38.5, rr_high=40, rr_low=15, map_low=55, shock_index_critical=1.0, mews_critical=4)
ADULT = VitalThresholds(hr_high=150, hr_low=50, sbp_low=80, spo2_low=90, temp_high=39.5, rr_high=30, rr_low=10, map_low=65, shock_index_critical=1.0, mews_critical=5)
GERIATRIC = VitalThresholds(hr_high=130, hr_low=50, sbp_low=90, spo2_low=92, temp_high=38.3, rr_high=28, rr_low=10, map_low=70, shock_index_critical=0.9, mews_critical=4)

def classify_age_group(age: int) -> str:
    if age <= 12: return 'pediatric'
    elif age <= 64: return 'adult'
    else: return 'geriatric'

def get_thresholds(age: int) -> VitalThresholds:
    group = classify_age_group(age)
    return {'pediatric': PEDIATRIC, 'adult': ADULT, 'geriatric': GERIATRIC}[group]
