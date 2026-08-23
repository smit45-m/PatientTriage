"""Clinical scoring calculations"""

def calc_shock_index(hr: int | None, sbp: int | None) -> float | None:
    if hr is None or sbp is None or sbp == 0:
        return None
    return round(hr / sbp, 2)

def calc_mews(hr: int | None, sbp: int | None, rr: int | None, temp: float | None, consciousness: str = 'alert') -> int | None:
    if None in (hr, sbp, rr, temp):
        return None
    
    score = 0
    
    if hr <= 40: score += 2
    elif hr <= 50: score += 1
    elif hr <= 100: score += 0
    elif hr <= 110: score += 1
    elif hr <= 129: score += 2
    else: score += 3
        
    if sbp <= 70: score += 3
    elif sbp <= 80: score += 2
    elif sbp <= 100: score += 1
    elif sbp <= 199: score += 0
    else: score += 2
        
    if rr < 9: score += 3
    elif rr <= 14: score += 0
    elif rr <= 20: score += 1
    elif rr <= 29: score += 2
    else: score += 3
        
    if temp < 35: score += 1
    elif temp <= 38.4: score += 0
    elif temp < 39: score += 1
    else: score += 2
        
    c = consciousness.lower()
    if c == 'alert': score += 0
    elif c == 'reacting to voice': score += 1
    elif c == 'reacting to pain': score += 2
    elif c == 'unresponsive': score += 3
    
    return score

def calc_map(sbp: int | None, dbp: int | None) -> float | None:
    if sbp is None or dbp is None:
        return None
    return round((sbp + 2 * dbp) / 3, 2)

def calc_all_derived(vitals: dict, consciousness: str = 'alert') -> dict:
    hr = vitals.get('hr')
    sbp = vitals.get('sbp')
    dbp = vitals.get('dbp')
    rr = vitals.get('rr')
    temp = vitals.get('temp')
    
    return {
        'shock_index': calc_shock_index(hr, sbp),
        'mews': calc_mews(hr, sbp, rr, temp, consciousness),
        'map': calc_map(sbp, dbp)
    }

def assess_vital_flags(vitals: dict, thresholds) -> list[str]:
    flags = []
    
    hr = vitals.get('hr')
    if hr is not None:
        if hr > thresholds.hr_high: flags.append('HR_critically_high')
        if hr < thresholds.hr_low: flags.append('HR_critically_low')
        
    sbp = vitals.get('sbp')
    if sbp is not None:
        if sbp < thresholds.sbp_low: flags.append('SBP_critically_low')
        
    spo2 = vitals.get('spo2')
    if spo2 is not None:
        if spo2 < thresholds.spo2_low: flags.append('SpO2_critically_low')
        
    rr = vitals.get('rr')
    if rr is not None:
        if rr > thresholds.rr_high: flags.append('RR_critically_high')
        if rr < thresholds.rr_low: flags.append('RR_critically_low')
        
    temp = vitals.get('temp')
    if temp is not None:
        if temp > thresholds.temp_high: flags.append('Temp_critically_high')
        
    return flags
