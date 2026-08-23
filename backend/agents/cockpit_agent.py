"""Agent 5: Final Recommendation Assembly"""
from datetime import datetime, timezone
import uuid


def cockpit_agent(state: dict) -> dict:
    """Assembles final recommendation package with routing, SHAP values, and audit entry."""
    adj = state.get('adjusted_prediction', {})
    esi = adj.get('esi', 5) if isinstance(adj, dict) else adj
    confidence = adj.get('confidence', 0.5) if isinstance(adj, dict) else 0.5
    probs = adj.get('probabilities', [0.2]*5) if isinstance(adj, dict) else [0.2]*5

    routing_map = {
        1: 'Resuscitation Bay',
        2: 'Acute Care',
        3: 'Urgent Care',
        4: 'Fast Track',
        5: 'Waiting Room',
    }

    patient = state.get('patient', {})
    vitals = patient.get('vitals', {})
    derived = state.get('derived_scores', {})
    ml_score = state.get('ml_score', {})

    # Build SHAP-style feature importance from ML model
    shap_values = ml_score.get('feature_importance', {})
    # Sort and take top 6
    if shap_values:
        top_features = dict(sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)[:6])
    else:
        # Fallback: use vital deviations as proxy importance
        top_features = {
            'sbp': abs(vitals.get('sbp', 120) - 120) / 120,
            'hr': abs(vitals.get('hr', 80) - 80) / 80,
            'spo2': abs(vitals.get('spo2', 98) - 98) / 98,
            'shock_index': abs(derived.get('shock_index', 0.7) - 0.7),
            'mews': derived.get('mews', 0) / 14,
            'temp': abs(vitals.get('temp', 37.0) - 37.0) / 37.0,
        }

    recommendations = [
        f"Route to {routing_map.get(esi, 'Waiting Room')}",
    ]
    if esi <= 2:
        recommendations.append("Continuous vital monitoring required")
        recommendations.append("Notify attending physician immediately")
    elif esi == 3:
        recommendations.append("Monitor vitals every 15 minutes")
    else:
        recommendations.append("Routine monitoring")

    audit_entry = {
        'event_id': str(uuid.uuid4()),
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'patient_id': patient.get('patient_id', 'unknown'),
        'patient_name': patient.get('name', 'Unknown'),
        'nurse_id': 'RN-Sarah',
        'pipeline_version': '2.0.0',
        'regulatory_jurisdiction': 'HIPAA (US)',
        'age_group': state.get('age_group', 'unknown'),
        'derived_scores': derived,
        'ml_prediction': state.get('ml_score', {}),
        'nlp_extraction': state.get('nlp_extraction', {}),
        'fused_prediction': state.get('fused_prediction', {}),
        'safety_overrides': state.get('safety_overrides', []),
        'action_type': state.get('action_type', 'RECOMMEND'),
        'confidence_flag': state.get('confidence_flag', 'medium'),
        'final_esi': esi,
        'final_confidence': confidence,
        'routing': routing_map.get(esi, 'Waiting Room'),
        'rationale': state.get('rag_rationale', ''),
        'override': None,
    }

    return {
        'final_esi': esi,
        'final_confidence': confidence,
        'recommendations': recommendations,
        'shap_values': top_features,
        'routing': routing_map.get(esi, 'Waiting Room'),
        'audit_entry': audit_entry,
    }

