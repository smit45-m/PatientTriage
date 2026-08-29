"""Audit Logger"""
import json
import os
from datetime import datetime, timezone

class AuditLogger:
    def __init__(self, log_file='audit_log.json'):
        self.log_file = log_file
        self.logs = []
        if os.path.exists(log_file):
            try:
                with open(log_file, 'r') as f:
                    self.logs = json.load(f)
            except (json.JSONDecodeError, IOError):
                pass
                
    def _save(self):
        with open(self.log_file, 'w') as f:
            json.dump(self.logs, f, indent=2)
            
    def log_triage(self, audit_entry: dict):
        entry = audit_entry.copy()
        entry['type'] = 'triage'
        if 'timestamp' not in entry:
            entry['timestamp'] = datetime.now(timezone.utc).isoformat()
        self.logs.append(entry)
        self._save()
        
    def log_override(self, patient_id, original_esi, new_esi, reason, nurse_id, timestamp=None):
        if timestamp is None:
            timestamp = datetime.now(timezone.utc).isoformat()
        entry = {
            'type': 'override',
            'patient_id': patient_id,
            'original_esi': original_esi,
            'new_esi': new_esi,
            'reason': reason,
            'nurse_id': nurse_id,
            'timestamp': timestamp
        }
        self.logs.append(entry)
        self._save()
        
    def get_all_logs(self) -> list[dict]:
        return self.logs
        
    def get_patient_logs(self, patient_id) -> list[dict]:
        return [log for log in self.logs if log.get('patient_id') == patient_id]
        
    def get_override_stats(self) -> dict:
        overrides = [l for l in self.logs if l.get('type') == 'override']
        up_triage = sum(1 for o in overrides if o['new_esi'] < o['original_esi'])
        down_triage = sum(1 for o in overrides if o['new_esi'] > o['original_esi'])
        return {
            'total_overrides': len(overrides),
            'up_triage': up_triage,
            'down_triage': down_triage
        }
        
    def clear_logs(self):
        self.logs = []
        self._save()
