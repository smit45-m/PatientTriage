"""Asymmetric Loss Adjuster for Triage — Layer 2 Safety"""


class AsymmetricAdjuster:
    def __init__(self, under_triage_penalty: float = 20.0):
        self.penalty = under_triage_penalty

    def adjust_probabilities(self, probabilities, current_esi: int) -> dict:
        """Shift prediction toward higher acuity under uncertainty.
        
        Args:
            probabilities: list[float] of length 5 (ESI 1-5 probs) or dict {esi: prob}
            current_esi: int, current ESI prediction
        """
        # Normalize input to dict {esi_level: prob}
        if isinstance(probabilities, list):
            prob_dict = {i + 1: p for i, p in enumerate(probabilities)}
        else:
            prob_dict = dict(probabilities)

        sorted_esi = sorted(prob_dict.items(), key=lambda x: x[1], reverse=True)

        if len(sorted_esi) < 2:
            return {
                'original_esi': current_esi,
                'adjusted_esi': current_esi,
                'original_probs': list(prob_dict.values()),
                'adjusted_probs': list(prob_dict.values()),
                'adjustment_applied': False,
                'reason': 'Not enough classes',
            }

        top1_esi, top1_prob = sorted_esi[0]
        top2_esi, top2_prob = sorted_esi[1]

        adjusted_esi = current_esi
        adjustment_applied = False
        reason = 'No adjustment needed'

        # If margin between top-2 is < 10%, prefer higher acuity (lower ESI number)
        if (top1_prob - top2_prob) < 0.10:
            if top2_esi < top1_esi:
                adjusted_esi = top2_esi
                adjustment_applied = True
                margin = round(top1_prob - top2_prob, 3)
                reason = f'Up-triaged ESI-{top1_esi}→ESI-{top2_esi} (margin={margin}, asymmetric 20× penalty)'

        adjusted_probs = list(prob_dict.values())

        return {
            'original_esi': current_esi,
            'adjusted_esi': adjusted_esi,
            'original_probs': list(prob_dict.values()),
            'adjusted_probs': adjusted_probs,
            'adjustment_applied': adjustment_applied,
            'reason': reason,
        }

