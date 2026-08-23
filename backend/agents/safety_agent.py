"""Agent 3: Safety Checks & Action Governance"""
from safety.rules_engine import SafetyRulesEngine
from safety.asymmetric_loss import AsymmetricAdjuster
from safety.confidence_gate import ConfidenceGate
from config.vital_thresholds import get_thresholds


def safety_agent(state: dict) -> dict:
    """Applies 3 safety layers: rules, asymmetric penalty, confidence gating."""
    patient = state.get('patient', {})
    vitals = patient.get('vitals', {})
    derived_scores = state.get('derived_scores', {})
    fused = state.get('fused_prediction', {})
    fused_esi = fused.get('esi', 3) if isinstance(fused, dict) else fused
    fused_probs = fused.get('probabilities', [0.2]*5) if isinstance(fused, dict) else [0.2]*5
    fused_confidence = fused.get('confidence', 0.5) if isinstance(fused, dict) else max(fused_probs)
    nlp_extraction = state.get('nlp_extraction', {})
    age_group = state.get('age_group', 'adult')
    thresholds = get_thresholds(patient.get('age', 45))

    # Layer 3: Hard-coded red-flag rules
    rules_engine = SafetyRulesEngine(thresholds)
    nlp_flags = nlp_extraction.get('semantic_flags', [])
    safety_overrides = rules_engine.evaluate(vitals, derived_scores, nlp_flags, age_group)

    # Layer 2: Asymmetric loss adjustment
    adjuster = AsymmetricAdjuster()
    adjustment = adjuster.adjust_probabilities(fused_probs, fused_esi)
    adjusted_esi = adjustment.get('adjusted_esi', fused_esi)
    adjusted_probs = adjustment.get('adjusted_probs', fused_probs)

    # Layer 4: Confidence gating
    gate = ConfidenceGate()
    confidence_result = gate.evaluate(fused_confidence, adjusted_esi)

    # Determine action type and apply safety overrides
    final_esi = adjusted_esi

    # Apply safety rule overrides (always take highest acuity / lowest ESI number)
    for override in safety_overrides:
        rule_esi = override.get('override_esi')
        if rule_esi and rule_esi < final_esi:
            final_esi = rule_esi

    # Governance logic:
    # 1. ESI-1 is ALWAYS autonomous escalation (DECIDE)
    # 2. Low confidence or high-risk review is ESCALATE (Defer to senior clinician)
    # 3. Standard predictions are RECOMMEND
    if final_esi == 1:
        action_type = 'DECIDE'
    elif confidence_result.get('needs_senior_review') or fused_confidence < 0.70:
        action_type = 'ESCALATE'
    else:
        action_type = 'RECOMMEND'

    confidence_flag = confidence_result.get('confidence_level', 'medium')

    return {
        'safety_overrides': safety_overrides,
        'confidence_flag': confidence_flag,
        'confidence_result': confidence_result,
        'action_type': action_type,
        'adjusted_prediction': {
            'esi': final_esi,
            'confidence': fused_confidence,
            'probabilities': adjusted_probs,
            'adjustment': adjustment,
        },
    }

