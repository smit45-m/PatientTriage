"""Agent 4: RAG-Based Clinical Rationale Generation (Dual-Engine: Open-Source LLM + Deterministic Grounding)

Generates patient-specific, clinically grounded explanations by combining:
1. ESI Handbook guideline retrieval
2. Patient-specific vital sign analysis (Shock Index, MAP, MEWS)
3. NLP-extracted clinical indicators & semantic emergency protocols
4. Safety rule context & action governance
5. Age-group-specific clinical reasoning (Pediatric / Geriatric)
6. Optional Open-Source LLM neural synthesis (BioMistral / Llama 3 via Ollama) with zero-latency deterministic fallback
"""
import json
import os
import requests
from typing import Optional


def load_guidelines():
    guidelines_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'esi_guidelines.json')
    try:
        with open(guidelines_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


# Clinical context templates keyed by semantic flag
CLINICAL_CONTEXTS = {
    'coma_unresponsive': (
        'Severe neurological depression / coma identified (GCS ≤ 8 or unresponsive). '
        'Per ATLS / Emergency Neurological Life Support (ENLS) guidelines: immediate airway protection '
        'via endotracheal intubation is indicated. Check fingerstick glucose immediately, assess pupillary reactivity, '
        'and obtain emergent non-contrast head CT.'
    ),
    'status_epilepticus': (
        'Status epilepticus / active prolonged seizure protocol activated. '
        'Per American Epilepsy Society (AES) guidelines: administer IV lorazepam 4mg (or IM midazolam 10mg) '
        'as first-line therapy within 5-10 minutes. Prepare second-line IV levetiracetam or fosphenytoin. '
        'Continuous EEG and airway team on standby.'
    ),
    'stroke': (
        'Acute stroke protocol activated. Presentation matches FAST criteria '
        '(Face drooping, Arm weakness, Speech difficulty, Time to call 911). '
        'Within thrombolysis window — every minute of delay destroys 1.9 million neurons. '
        'Per AHA/ASA guidelines, door-to-CT target is under 25 minutes.'
    ),
    'sah': (
        'Presentation consistent with subarachnoid hemorrhage: thunderclap headache described as '
        '"worst headache of life" with neck stiffness. Per ACEP guidelines, this requires immediate '
        'non-contrast CT head followed by lumbar puncture if CT is negative. '
        'Neurosurgery consultation indicated.'
    ),
    'cardiac_critical': (
        'Presentation consistent with acute coronary syndrome / life-threatening cardiac event. '
        'Per AHA chest pain pathway: obtain 12-lead ECG within 10 minutes of arrival, draw serial high-sensitivity '
        'troponins, administer aspirin 325mg if not contraindicated, and activate cardiac catheterization team.'
    ),
    'airway_anaphylaxis': (
        'Airway compromise / severe anaphylaxis identified. '
        'Per WAO / AAAAI anaphylaxis guidelines: administer intramuscular epinephrine (0.3mg 1:1000 in anterolateral thigh) '
        'immediately. Prepare for difficult airway intubation. High-flow oxygen and rapid IV crystalloid bolus.'
    ),
    'high_risk_ob_surgical': (
        'High-risk acute surgical / obstetric emergency identified (suspected ruptured ectopic pregnancy, acute torsion, '
        'aortic dissection, or acute surgical abdomen). '
        'Per ACOG / ACS guidelines: obtain emergent bedside ultrasound (FAST/TVUS), establish two large-bore IVs, '
        'type and crossmatch 2-4 units PRBCs, and request STAT surgical/OBGYN consultation.'
    ),
    'overdose_toxic': (
        'Severe toxic ingestion / opioid or polypharmacy overdose with respiratory depression. '
        'Contact Poison Control (1-800-222-1222). Administer IV/IN Naloxone titrated to respiratory rate ≥ 12. '
        'Continuous pulse oximetry, capnography, and 12-lead ECG for QTc prolongation.'
    ),
    'sepsis': (
        'Presentation raises concern for sepsis / septic shock. Per Surviving Sepsis Campaign: obtain blood '
        'cultures prior to antibiotics, administer broad-spectrum IV antibiotics within 1 hour, measure serum lactate, '
        'and initiate 30 mL/kg IV crystalloid fluid resuscitation targeting MAP ≥ 65 mmHg.'
    ),
}

# Age-group specific clinical caveats
AGE_CAVEATS = {
    'pediatric': (
        'PEDIATRIC ALERT: Age-adjusted vital sign thresholds applied. '
        'Children compensate hemodynamically until late decompensation — '
        'normal blood pressure does NOT rule out shock in pediatric patients. '
        'Weight-based medication dosing required.'
    ),
    'geriatric': (
        'GERIATRIC ALERT: Elderly patients often present atypically — '
        'absence of fever does not exclude infection, and baseline vital signs '
        'may mask deterioration. Polypharmacy interactions and fall risk must be '
        'assessed. Lower threshold for admission recommended.'
    ),
}


_OLLAMA_STATUS = {'is_online': False, 'last_checked': 0.0}

def _is_ollama_available() -> bool:
    """Fast-cached health check for local Ollama service (checked at most once every 60s)."""
    import time
    now = time.time()
    if (now - _OLLAMA_STATUS['last_checked']) < 60.0:
        return _OLLAMA_STATUS['is_online']
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=0.15)
        _OLLAMA_STATUS['is_online'] = (r.status_code == 200)
    except Exception:
        _OLLAMA_STATUS['is_online'] = False
    _OLLAMA_STATUS['last_checked'] = now
    return _OLLAMA_STATUS['is_online']


def _generate_with_local_llm(patient_summary: str, vital_narrative: str, guideline_text: str, esi: int, action_type: str) -> Optional[str]:
    """Attempts to query local open-source LLM (BioMistral / Llama 3 via Ollama) only if service is actively online.
    Returns None if Ollama is offline or unavailable, prompting fallback to deterministic synthesis."""
    if not _is_ollama_available():
        return None
    try:
        url = "http://localhost:11434/api/generate"
        prompt = (
            f"You are an expert emergency medicine triage assistant. "
            f"Synthesize a concise 3-4 sentence clinical rationale explaining why this patient is assigned ESI-{esi} ({action_type}).\n\n"
            f"Patient Presentation: {patient_summary}\n"
            f"Hemodynamic Findings: {vital_narrative}\n"
            f"Clinical Guidelines & Safety Context: {guideline_text}\n\n"
            f"Clinical Rationale:"
        )
        payload = {
            "model": "biomistral",
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.2, "num_predict": 120}
        }
        res = requests.post(url, json=payload, timeout=1.5)
        if res.status_code == 200:
            text = res.json().get("response", "").strip()
            if len(text) > 40:
                return text
    except Exception:
        pass
    return None


def _build_vital_narrative(vitals: dict, derived: dict, vital_flags: list) -> str:
    """Build a clinically meaningful narrative from vital signs."""
    parts = []
    
    hr = vitals.get('hr')
    sbp = vitals.get('sbp')
    spo2 = vitals.get('spo2')
    rr = vitals.get('rr')
    temp = vitals.get('temp')
    pain = vitals.get('pain')

    si = derived.get('shock_index', 0)
    mews = derived.get('mews', 0)
    map_val = derived.get('map', 0)

    if si and si > 1.0:
        parts.append(f'Shock Index critically elevated at {si:.2f} (HR/SBP = {hr}/{sbp}), '
                      f'indicating hemodynamic instability')
    elif si and si > 0.9:
        parts.append(f'Shock Index concerning at {si:.2f}, approaching critical threshold')

    if map_val and map_val < 65:
        parts.append(f'MAP {map_val:.0f} mmHg — below 65 mmHg threshold for adequate organ perfusion')
    
    if mews and mews >= 5:
        parts.append(f'MEWS score {mews} (≥5 indicates high risk of clinical deterioration)')

    if spo2 is not None and spo2 < 92:
        parts.append(f'SpO2 {spo2}% — significant hypoxemia requiring supplemental oxygen')
    elif spo2 is not None and spo2 < 95:
        parts.append(f'SpO2 {spo2}% — borderline oxygen saturation, monitor closely')

    if hr is not None and hr > 130:
        parts.append(f'Heart rate {hr} bpm — significant tachycardia')
    elif hr is not None and hr < 50:
        parts.append(f'Heart rate {hr} bpm — clinically significant bradycardia')

    if temp is not None and temp > 38.5:
        parts.append(f'Temperature {temp}°C — febrile, evaluate for infectious source')
    elif temp is not None and temp < 35.0:
        parts.append(f'Temperature {temp}°C — hypothermia present')

    if pain is not None and pain >= 8:
        parts.append(f'Severe pain reported ({pain}/10)')

    if not parts:
        parts.append('Vital signs within normal parameters')

    return '. '.join(parts)


def _build_action_items(esi: int, semantic_flags: list, action_type: str) -> list:
    """Generate actionable next-steps based on ESI and clinical context."""
    items = []
    
    if esi == 1:
        items.append('Route to Resuscitation Bay immediately')
        items.append('Continuous vital sign monitoring with 1:1 nursing')
        items.append('Notify attending physician STAT')
    elif esi == 2:
        items.append('Route to Acute Care / Monitored Bed')
        items.append('Initiate workup within 10 minutes')
    elif esi == 3:
        items.append('Standard assessment — anticipate 2+ resources')
        items.append('Re-assess if condition changes or wait exceeds 30 minutes')
    elif esi == 4:
        items.append('Single resource pathway — targeted evaluation')
        items.append('Re-assess if wait exceeds 60 minutes')
    else:
        items.append('Fast-track pathway — focused assessment')
        items.append('Discharge planning can begin at intake')

    for flag in semantic_flags:
        if flag == 'stroke':
            items.append('STAT CT head — target door-to-CT < 25 min')
            items.append('Activate stroke team if not already notified')
        elif flag in ['cardiac_critical', 'cardiac']:
            items.append('12-lead ECG within 10 minutes')
            items.append('Draw troponin, BMP, CBC')
        elif flag == 'sah':
            items.append('STAT non-contrast CT head')
            items.append('Neurosurgery consult on standby')
        elif flag == 'sepsis':
            items.append('Blood cultures × 2, then IV antibiotics within 1 hour')
            items.append('Serum lactate level')
        elif flag == 'airway_anaphylaxis':
            items.append('IM Epinephrine 0.3mg (1:1000) STAT')
            items.append('Difficult airway cart to bedside')
        elif flag == 'high_risk_ob_surgical':
            items.append('Bedside ultrasound (FAST / TVUS) STAT')
            items.append('Two large-bore IVs + Blood Type & Screen')

    if action_type == 'DECIDE':
        items.append('⚠️ AI has auto-escalated — clinician review for confirmation')
    
    return items


def rag_agent(state: dict) -> dict:
    """Generate patient-specific clinical rationale grounded in ESI guidelines."""
    adj = state.get('adjusted_prediction', {})
    esi = adj.get('esi', 5) if isinstance(adj, dict) else adj
    esi_str = str(esi)
    patient = state.get('patient', {})
    vitals = patient.get('vitals', {})
    derived_scores = state.get('derived_scores', {})
    vital_flags = state.get('vital_flags', [])
    nlp = state.get('nlp_extraction', {})
    safety_overrides = state.get('safety_overrides', [])
    action_type = state.get('action_type', 'RECOMMEND')
    age_group = state.get('age_group', 'adult')
    fused = state.get('fused_prediction', {})

    # 1. Retrieve ESI guideline
    guidelines = load_guidelines()
    esi_data = guidelines.get(esi_str, {})
    esi_desc = esi_data.get('description', 'Standard triage pathway')

    # 2. Build patient header
    name = patient.get('name', 'Patient')
    age = patient.get('age', '')
    sex = patient.get('sex', '')
    cc = patient.get('chief_complaint', 'Undisclosed')
    
    header = f'This {age}-year-old {sex} presenting with "{cc}"'

    # 3. Build vital sign narrative
    vital_narrative = _build_vital_narrative(vitals, derived_scores, vital_flags)

    # 4. Build clinical context from semantic flags
    semantic_flags = nlp.get('semantic_flags', [])
    context_parts = []
    for flag in semantic_flags:
        if flag in CLINICAL_CONTEXTS:
            context_parts.append(CLINICAL_CONTEXTS[flag])

    # 5. Safety rule narrative
    safety_narrative = ''
    if safety_overrides:
        rule_names = [r.get('rule_name', '') for r in safety_overrides]
        actions = list(set(r.get('action', '') for r in safety_overrides))
        safety_narrative = (
            f'Safety system triggered {len(safety_overrides)} rule(s): '
            f'{", ".join(rule_names)}. '
            f'Required actions: {", ".join(actions)}.'
        )

    # 6. Age-group caveat
    age_caveat = AGE_CAVEATS.get(age_group, '')

    # 7. Confidence narrative
    confidence = fused.get('confidence', 0) if isinstance(fused, dict) else 0
    if confidence >= 0.85:
        conf_text = f'AI confidence is high ({confidence:.0%}).'
    elif confidence >= 0.70:
        conf_text = f'AI confidence is moderate ({confidence:.0%}). Clinical correlation advised.'
    else:
        conf_text = f'AI confidence is low ({confidence:.0%}). Senior clinician review strongly recommended.'

    # 8. Check if Open-Source LLM is available for neural synthesis; otherwise use deterministic guideline engine
    llm_rationale = _generate_with_local_llm(
        patient_summary=f"{age}-year-old {sex}, '{cc}'",
        vital_narrative=vital_narrative,
        guideline_text=f"ESI-{esi}: {esi_desc}. " + " ".join(context_parts) + f" {safety_narrative} {age_caveat}",
        esi=esi,
        action_type=action_type
    )

    if llm_rationale:
        rationale = llm_rationale
    else:
        sections = [header + f' meets ESI-{esi} criteria: {esi_desc}.']
        sections.append(vital_narrative + '.')

        if context_parts:
            sections.extend(context_parts)

        if safety_narrative:
            sections.append(safety_narrative)

        if age_caveat:
            sections.append(age_caveat)

        sections.append(conf_text)
        rationale = ' '.join(sections)

    # 9. Build action items
    action_items = _build_action_items(esi, semantic_flags, action_type)

    return {
        'rag_rationale': rationale,
        'retrieved_guidelines': esi_data,
        'recommendations': action_items,
    }
