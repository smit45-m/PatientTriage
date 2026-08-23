"""Agent 1: Patient Intake & Vital Validation"""
from config.vital_thresholds import get_thresholds, classify_age_group
from utils.scoring import calc_all_derived, assess_vital_flags


def intake_agent(state: dict) -> dict:
    """Validates vitals, classifies age group, computes derived scores, flags missing data."""
    patient = state.get('patient', {})
    vitals = patient.get('vitals', {})
    age = patient.get('age', 45)

    # Classify age group and get age-appropriate thresholds
    age_group = classify_age_group(age)
    thresholds = get_thresholds(age)

    # Compute derived clinical scores
    derived_scores = calc_all_derived(vitals)

    # Assess vital flags against age-appropriate thresholds
    vital_flags = assess_vital_flags(vitals, thresholds)

    # Check for missing data (Layer 1: Modality Dropout)
    vital_keys = ['hr', 'sbp', 'dbp', 'spo2', 'rr', 'temp']
    missing_data = [k for k in vital_keys if k not in vitals or vitals[k] is None]

    if patient.get('medical_history') is None:
        missing_data.append('medical_history')
    if not patient.get('has_prior_records', False):
        missing_data.append('prior_records')

    # Convert thresholds dataclass to dict for JSON serialization
    thresholds_dict = {
        'hr_high': thresholds.hr_high, 'hr_low': thresholds.hr_low,
        'sbp_low': thresholds.sbp_low, 'spo2_low': thresholds.spo2_low,
        'temp_high': thresholds.temp_high, 'rr_high': thresholds.rr_high,
        'rr_low': thresholds.rr_low, 'map_low': thresholds.map_low,
        'shock_index_critical': thresholds.shock_index_critical,
        'mews_critical': thresholds.mews_critical,
    }

    return {
        'age_group': age_group,
        'derived_scores': derived_scores,
        'vital_flags': vital_flags,
        'missing_data': missing_data,
        'thresholds': thresholds_dict,
    }
