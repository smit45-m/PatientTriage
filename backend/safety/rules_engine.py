"""Safety Rules Engine for Clinical Red Flags"""

class SafetyRulesEngine:
    def __init__(self, thresholds):
        self.thresholds = thresholds
        
    def evaluate(self, vitals, derived_scores, nlp_flags, age_group) -> list[dict]:
        triggered = []
        
        hr = vitals.get('hr')
        sbp = vitals.get('sbp')
        spo2 = vitals.get('spo2')
        rr = vitals.get('rr')
        temp = vitals.get('temp')
        
        si = derived_scores.get('shock_index')
        mews = derived_scores.get('mews')
        map_val = derived_scores.get('map')
        
        # R001: Critical hypotension
        if sbp is not None and sbp < self.thresholds.sbp_low:
            triggered.append({'rule_id': 'R001', 'rule_name': 'Critical hypotension', 'triggered_by': f'SBP={sbp}', 'override_esi': 1, 'severity': 'critical', 'action': 'Immediate resuscitation'})
            
        # R002: Severe hypoxemia
        if spo2 is not None and spo2 < self.thresholds.spo2_low:
            triggered.append({'rule_id': 'R002', 'rule_name': 'Severe hypoxemia', 'triggered_by': f'SpO2={spo2}', 'override_esi': 1, 'severity': 'critical', 'action': 'Oxygen therapy'})
            
        # R003: Extreme tachycardia
        if hr is not None and hr > self.thresholds.hr_high:
            triggered.append({'rule_id': 'R003', 'rule_name': 'Extreme tachycardia', 'triggered_by': f'HR={hr}', 'override_esi': 2, 'severity': 'high', 'action': 'ECG and monitoring'})
            
        # R004: Extreme bradycardia
        if hr is not None and hr < self.thresholds.hr_low:
            triggered.append({'rule_id': 'R004', 'rule_name': 'Extreme bradycardia', 'triggered_by': f'HR={hr}', 'override_esi': 2, 'severity': 'high', 'action': 'ECG and monitoring'})
            
        # R005: Shock index critical
        if si is not None and si > self.thresholds.shock_index_critical:
            triggered.append({'rule_id': 'R005', 'rule_name': 'Shock index critical', 'triggered_by': f'SI={si}', 'override_esi': 1, 'severity': 'critical', 'action': 'Evaluate for shock'})
            
        # R006: MEWS critical
        if mews is not None and mews >= self.thresholds.mews_critical:
            triggered.append({'rule_id': 'R006', 'rule_name': 'MEWS critical', 'triggered_by': f'MEWS={mews}', 'override_esi': 2, 'severity': 'high', 'action': 'Physician review'})
            
        # R007: MAP dangerously low
        if map_val is not None and map_val < 65:
            triggered.append({'rule_id': 'R007', 'rule_name': 'MAP dangerously low', 'triggered_by': f'MAP={map_val}', 'override_esi': 1, 'severity': 'critical', 'action': 'Hemodynamic support'})
            
        # R008: Altered mental status + geriatric
        if age_group == 'geriatric' and 'altered_mental_status' in nlp_flags:
            triggered.append({'rule_id': 'R008', 'rule_name': 'Altered mental status in geriatric', 'triggered_by': 'AMS+Age', 'override_esi': 2, 'severity': 'high', 'action': 'Neuro exam'})
            
        # R009: Pediatric high fever
        if age_group == 'pediatric' and temp is not None and temp > self.thresholds.temp_high:
            triggered.append({'rule_id': 'R009', 'rule_name': 'Pediatric high fever', 'triggered_by': f'Temp={temp}', 'override_esi': 2, 'severity': 'high', 'action': 'Fever control, infection workup'})
            
        # R010: Respiratory distress
        if rr is not None and rr > self.thresholds.rr_high and spo2 is not None and spo2 < 94:
            triggered.append({'rule_id': 'R010', 'rule_name': 'Respiratory distress', 'triggered_by': f'RR={rr}, SpO2={spo2}', 'override_esi': 1, 'severity': 'critical', 'action': 'Airway management'})
            
        # R011: Unresponsive / Coma / GCS <= 8
        if 'coma_unresponsive' in nlp_flags:
            triggered.append({'rule_id': 'R011', 'rule_name': 'Unresponsive / Severe Altered Consciousness', 'triggered_by': 'NLP: GCS<=8 / Unresponsive', 'override_esi': 1, 'severity': 'critical', 'action': 'Immediate resuscitation, airway protection STAT'})

        # R012: Status Epilepticus / Prolonged Seizure
        if 'status_epilepticus' in nlp_flags:
            triggered.append({'rule_id': 'R012', 'rule_name': 'Status Epilepticus / Active Seizure', 'triggered_by': 'NLP: Active/Prolonged Seizure', 'override_esi': 1, 'severity': 'critical', 'action': 'Benzodiazepines IV, protect airway STAT'})

        # R013: Acute stroke presentation (time-critical — thrombolysis window)
        if 'stroke' in nlp_flags:
            triggered.append({'rule_id': 'R013', 'rule_name': 'Acute stroke presentation', 'triggered_by': 'NLP: FAST criteria positive', 'override_esi': 1, 'severity': 'critical', 'action': 'FAST protocol, CT head STAT (<25m)'})

        # R014: Subarachnoid hemorrhage (thunderclap headache)
        if 'sah' in nlp_flags:
            triggered.append({'rule_id': 'R014', 'rule_name': 'Suspected Subarachnoid Hemorrhage', 'triggered_by': 'NLP: Thunderclap / Worst headache of life', 'override_esi': 1, 'severity': 'critical', 'action': 'Non-contrast CT head STAT, neurosurgery consult'})

        # R015: Airway compromise & Anaphylaxis
        if 'airway_anaphylaxis' in nlp_flags or 'airway' in nlp_flags:
            triggered.append({'rule_id': 'R015', 'rule_name': 'Airway Compromise / Anaphylaxis', 'triggered_by': 'NLP: Stridor/Tongue swelling/Silent chest', 'override_esi': 1, 'severity': 'critical', 'action': 'IM Epinephrine 0.3mg, Airway team STAT'})

        # R016: Critical Cardiac / Arrest Indicators
        if 'cardiac_critical' in nlp_flags:
            triggered.append({'rule_id': 'R016', 'rule_name': 'Critical Cardiac Event / Arrest Threat', 'triggered_by': 'NLP: Crushing chest pain/Syncope/Arrest', 'override_esi': 1, 'severity': 'critical', 'action': 'Code Blue / 12-lead ECG STAT, cath lab activation'})

        # R017: High-Risk Surgical / Ruptured Ectopic / Aortic Dissection
        if 'high_risk_ob_surgical' in nlp_flags:
            triggered.append({'rule_id': 'R017', 'rule_name': 'High-Risk Surgical/OB Emergency', 'triggered_by': 'NLP: Ectopic/Torsion/Aortic dissection/Rigid abdomen', 'override_esi': 2, 'severity': 'high', 'action': 'Emergent surgical/OBGYN consult, IV access, blood type & screen'})

        # R018: Toxic Ingestion / Severe Overdose
        if 'overdose_toxic' in nlp_flags or 'overdose' in nlp_flags:
            triggered.append({'rule_id': 'R018', 'rule_name': 'Toxic Ingestion / Overdose with Pinpoint Pupils', 'triggered_by': 'NLP: Toxic ingestion / respiratory depression', 'override_esi': 1, 'severity': 'critical', 'action': 'Naloxone / Poison Control / Continuous cardiac monitor'})

        return triggered
