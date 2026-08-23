"""Waiting Room Monitor"""
from datetime import datetime
import time

class WaitingRoomMonitor:
    def __init__(self, wait_thresholds=None):
        if wait_thresholds is None:
            self.wait_thresholds = {1: 0, 2: 10, 3: 30, 4: 60, 5: 120}
        else:
            self.wait_thresholds = wait_thresholds
        self.queue = {}
        
    def add_patient(self, patient_id, name, esi_level, arrival_time):
        self.queue[patient_id] = {
            'patient_id': patient_id,
            'name': name,
            'esi_level': esi_level,
            'arrival_time': arrival_time,
            'status': 'waiting'
        }
        
    def remove_patient(self, patient_id):
        if patient_id in self.queue:
            del self.queue[patient_id]
            
    def check_alerts(self, current_time=None) -> list[dict]:
        alerts = []
        if current_time is None:
            current_time = datetime.utcnow()
        elif isinstance(current_time, str):
            current_time = datetime.fromisoformat(current_time.replace('Z', '+00:00'))
            
        for pid, p in self.queue.items():
            arr_time = p['arrival_time']
            if isinstance(arr_time, str):
                arr_time = datetime.fromisoformat(arr_time.replace('Z', '+00:00'))
                
            if arr_time.tzinfo is None and current_time.tzinfo is not None:
                current_time = current_time.replace(tzinfo=None)
                
            wait_minutes = (current_time - arr_time).total_seconds() / 60.0
            esi = p['esi_level']
            threshold = self.wait_thresholds.get(esi, 120)
            
            if wait_minutes > threshold:
                alerts.append({
                    'patient_id': pid,
                    'name': p['name'],
                    'esi_level': esi,
                    'wait_minutes': round(wait_minutes, 1),
                    'threshold': threshold,
                    'message': f"Patient waiting {round(wait_minutes, 1)}m, exceeds ESI {esi} threshold of {threshold}m"
                })
        return alerts
        
    def get_queue(self) -> list[dict]:
        return list(self.queue.values())
        
    def get_queue_stats(self) -> dict:
        stats = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for p in self.queue.values():
            stats[p['esi_level']] = stats.get(p['esi_level'], 0) + 1
        return {
            'total_waiting': len(self.queue),
            'by_esi': stats
        }
