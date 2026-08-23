"""Confidence Gate for Triage Predictions"""

class ConfidenceGate:
    def __init__(self, threshold=0.70):
        self.threshold = threshold
        
    def evaluate(self, confidence: float, esi_prediction: int) -> dict:
        if confidence >= self.threshold + 0.15:
            level = 'high'
            needs_review = False
            rec = 'Auto-triage accepted.'
        elif confidence >= self.threshold:
            level = 'medium'
            needs_review = (esi_prediction in (1, 2))
            rec = 'Review recommended.' if needs_review else 'Auto-triage accepted with caution.'
        else:
            level = 'low'
            needs_review = True
            rec = 'Manual triage required due to low confidence.'
            
        return {
            'confidence_level': level,
            'needs_senior_review': needs_review,
            'recommendation': rec
        }
