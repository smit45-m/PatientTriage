"""Surge Detector"""
import time

class SurgeDetector:
    def __init__(self, baseline_rate, surge_multiplier=3.0):
        self.baseline_rate = baseline_rate
        self.surge_multiplier = surge_multiplier
        self.arrivals = []
        
    def record_arrival(self, timestamp=None):
        if timestamp is None:
            timestamp = time.time()
        self.arrivals.append(timestamp)
        # Keep only last 60 minutes
        cutoff = timestamp - 3600
        self.arrivals = [t for t in self.arrivals if t > cutoff]
        
    def is_surge(self) -> bool:
        return len(self.arrivals) > (self.baseline_rate * self.surge_multiplier)
        
    def get_surge_status(self) -> dict:
        current_rate = len(self.arrivals)
        is_active = current_rate > (self.baseline_rate * self.surge_multiplier)
        return {
            'is_surge': is_active,
            'current_rate_per_hour': current_rate,
            'baseline_rate': self.baseline_rate,
            'threshold': self.baseline_rate * self.surge_multiplier
        }
        
    def get_adapted_thresholds(self, base_thresholds) -> dict:
        # In a surge, thresholds might adapt, but we'll return as is for prototype
        # Or return a modified copy if needed.
        return base_thresholds
