"""Agent 2: ML Scoring + NLP Extraction + Late Fusion"""
import math
from models.tabular_scorer import TabularScorer
from models.nlp_extractor import ClinicalNLPExtractor


def _calculate_confidence(fused_probs, ml_esi, nlp_tier, fused_esi):
    """Multi-signal confidence calculator.
    
    Uses:
    1. Distribution sharpness (low entropy = high confidence)
    2. ML/NLP agreement bonus
    3. Sigmoid scaling to spread values realistically (55%-95%)
    """
    # 1. Entropy-based sharpness (0 = peaked/certain, log(5) = uniform/uncertain)
    max_entropy = math.log(5)  # ~1.609
    entropy = -sum(p * math.log(p + 1e-10) for p in fused_probs)
    sharpness = 1.0 - (entropy / max_entropy)  # 0..1, higher = more confident
    
    # 2. Raw max probability contribution
    raw_max = max(fused_probs)
    
    # 3. ML/NLP agreement bonus
    nlp_esi_map = {'critical': 1, 'high': 2, 'moderate': 3, 'minor': 4, 'non_urgent': 5}
    nlp_esi = nlp_esi_map.get(nlp_tier, 3)
    agreement_bonus = 0.0
    if ml_esi == nlp_esi:
        agreement_bonus = 0.15  # Both streams agree
    elif abs(ml_esi - nlp_esi) == 1:
        agreement_bonus = 0.07  # Adjacent agreement
    
    # 4. Combine signals
    raw_confidence = (0.35 * sharpness) + (0.40 * raw_max) + (0.25 * (raw_max ** 0.5)) + agreement_bonus
    
    # 5. Sigmoid scaling to spread into realistic 55%-95% range
    scaled = 0.55 + (0.40 * (1.0 / (1.0 + math.exp(-6 * (raw_confidence - 0.5)))))
    
    return round(min(0.95, max(0.55, scaled)), 2)


def ml_agent(state: dict) -> dict:
    """Runs dual-stream ML + NLP scoring and performs late fusion."""
    patient = state.get('patient', {})
    vitals = patient.get('vitals', {})
    derived_scores = state.get('derived_scores', {})

    # Build feature vector for TabularScorer
    features = {
        'age': patient.get('age', 45),
        'sex': 1 if patient.get('sex', 'M') == 'M' else 0,
        'hr': vitals.get('hr', 80),
        'sbp': vitals.get('sbp', 120),
        'dbp': vitals.get('dbp', 80),
        'spo2': vitals.get('spo2', 98),
        'rr': vitals.get('rr', 16),
        'temp': vitals.get('temp', 37.0),
        'pain': vitals.get('pain') if vitals.get('pain') is not None else 5,
        'arrival_mode': 1 if patient.get('arrival_mode') == 'ambulance' else 0,
        'shock_index': derived_scores.get('shock_index', 0.7),
        'mews': derived_scores.get('mews', 0),
        'map': derived_scores.get('map', 93),
    }

    # Tabular stream: XGBoost prediction
    scorer = TabularScorer()
    ml_result = scorer.predict(features)
    ml_probs = ml_result['probabilities']
    ml_esi = ml_result.get('esi_prediction', ml_probs.index(max(ml_probs)) + 1)

    # NLP stream: Clinical text analysis
    extractor = ClinicalNLPExtractor()
    chief_complaint = patient.get('chief_complaint', '')
    nlp_result = extractor.extract(chief_complaint)

    # Map NLP urgency to ESI probability distribution (5 tiers)
    nlp_tier = nlp_result.get('urgency_level', 'non_urgent')
    if nlp_tier == 'critical':
        nlp_probs = [0.88, 0.08, 0.02, 0.01, 0.01]
        weight_nlp = 0.45
    elif nlp_tier == 'high':
        nlp_probs = [0.08, 0.74, 0.14, 0.02, 0.02]
        weight_nlp = 0.38
    elif nlp_tier == 'moderate':
        nlp_probs = [0.02, 0.10, 0.72, 0.12, 0.04]
        weight_nlp = 0.35
    elif nlp_tier == 'minor':
        nlp_probs = [0.01, 0.03, 0.12, 0.72, 0.12]
        weight_nlp = 0.35
    else:  # non_urgent
        nlp_probs = [0.01, 0.01, 0.03, 0.15, 0.80]
        weight_nlp = 0.35

    weight_ml = 1.0 - weight_nlp

    # Late Fusion
    fused_probs = [round(weight_ml * ml_probs[i] + weight_nlp * nlp_probs[i], 4) for i in range(5)]
    total = sum(fused_probs)
    fused_probs = [round(p / total, 4) for p in fused_probs]  # Normalize
    fused_esi = fused_probs.index(max(fused_probs)) + 1
    
    # Multi-signal confidence calculation (replaces broken max(fused_probs))
    fused_confidence = _calculate_confidence(fused_probs, ml_esi, nlp_tier, fused_esi)

    return {
        'ml_score': ml_result,
        'nlp_extraction': nlp_result,
        'fused_prediction': {
            'esi': fused_esi,
            'confidence': fused_confidence,
            'probabilities': fused_probs,
        },
    }
