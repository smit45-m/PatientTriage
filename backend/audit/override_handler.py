"""Override Handler"""
from datetime import datetime

class OverrideHandler:
    def __init__(self, audit_logger):
        self.audit_logger = audit_logger
        
    def process_override(self, patient_id, original_esi, new_esi, reason, nurse_id) -> dict:
        self.audit_logger.log_override(
            patient_id=patient_id,
            original_esi=original_esi,
            new_esi=new_esi,
            reason=reason,
            nurse_id=nurse_id,
            timestamp=datetime.utcnow().isoformat()
        )
        return {
            'status': 'success',
            'patient_id': patient_id,
            'new_esi': new_esi,
            'message': f"Successfully overridden ESI for {patient_id} to {new_esi}"
        }
        
    def get_override_history(self, patient_id) -> list[dict]:
        logs = self.audit_logger.get_patient_logs(patient_id)
        return [log for log in logs if log.get('type') == 'override']
