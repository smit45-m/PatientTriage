"""Clinical NLP Extractor — 5-Tier Emergency Lexicon + Deep Clinical Semantic Flagging"""
import re


class ClinicalNLPExtractor:
    def __init__(self):
        self.lexicon = {
            'critical': {
                'score': 0.98,
                'terms': [
                    'unresponsive', 'not breathing', 'cardiac arrest', 'pulseless',
                    'seizure', 'status epilepticus', 'tonic-clonic', 'gunshot', 'stabbing',
                    'severe hemorrhage', 'massive bleeding', 'anaphylaxis', 'no pulse', 'intubated',
                    'cyanotic', 'silent chest', 'stridor', 'gcs', 'found down',
                    'facial droop', 'slurred speech', 'worst headache', 'thunderclap',
                    'sudden weakness', 'hemiplegia', 'hemiparesis', 'aphasia',
                    'pinpoint pupils', 'pulseless electrical', 'unrecordable',
                ],
            },
            'high': {
                'score': 0.82,
                'terms': [
                    'chest pain', 'difficulty breathing', 'shortness of breath',
                    'altered mental status', 'confused', 'confusion', 'lethargic', 'lethargy',
                    'stroke', 'severe pain', 'vomiting blood', 'hematemesis', 'melena',
                    'coughing blood', 'overdose', 'poisoning', 'toxic', 'ingested bleach',
                    'trauma', 'unconscious', 'bleeding heavily', 'severe bleeding',
                    'neck stiff', 'neck stiffness', 'stiff neck', 'diaphoretic', 'crushing',
                    'drooling', 'gagging', 'kussmaul', 'fruity breath', 'purpuric rash',
                    'vaginal bleeding', 'rigid abdomen', 'testicular pain', 'scrotal swelling',
                    'ripping back pain', 'tearing pain', 'charcot', 'jaundice',
                    'ectopic', 'positive pregnancy test', 'epistaxis', 'tarry stool',
                ],
            },
            'moderate': {
                'score': 0.58,
                'terms': [
                    'abdominal pain', 'fever', 'dizziness', 'dizzy',
                    'fall', 'fell', 'fracture', 'deep laceration', 'tenderness',
                    'vomiting', 'headache', 'pregnant', 'wheezing', 'asthma',
                    'swollen calf', 'dvt', 'flank pain', 'hematuria', 'pyelonephritis',
                    'pleuritic', 'pneumonia', 'knee replacement', 'wound erythema',
                    'draining', 'infection', 'cramping', 'discomfort', 'spicy meal',
                ],
            },
            'minor': {
                'score': 0.35,
                'terms': [
                    'sprain', 'twisted ankle', 'ankle injury', 'limping', 'malleolus',
                    'clean laceration', 'superficial laceration', 'cut', 'furuncle',
                    'abscess', 'muscle spasm', 'lumbar spasm', 'back spasm', 'gout flare',
                    'panic attack', 'hyperventilating', 'tingling', 'foreign body',
                ],
            },
            'non_urgent': {
                'score': 0.12,
                'terms': [
                    'cough', 'cold', 'sore throat', 'scratchy throat', 'mild rash',
                    'poison ivy', 'contact dermatitis', 'refill', 'prescription refill',
                    'suture removal', 'tetanus booster', 'medical certificate',
                    'eating fine', 'eating normally', 'asymptomatic',
                ],
            },
        }

        self.negation_terms = ['no', 'not', 'denies', 'without', 'negative for', 'absence of']

        # Regex-based semantic patterns for safety rule escalation
        self.semantic_patterns = {
            'coma_unresponsive': [
                r'unresponsive', r'gcs\s*([3-8]\b)', r'found\s*down',
                r'fixed.*pupil', r'barely\s*responsive', r'unconscious',
            ],
            'status_epilepticus': [
                r'tonic.?clonic', r'seizure.*(>|\b(5|10|15|20)\s*min)',
                r'continuous.*seizure', r'status\s*epilepticus',
            ],
            'stroke': [
                r'facial\s*droop', r'slurred\s*speech', r'sudden.*weakness',
                r'hemipleg', r'hemipar', r'aphasia', r'loss\s*of\s*vision',
                r'one.sided.*weakness', r'right.sided.*weakness', r'left.sided.*weakness',
            ],
            'sah': [
                r'worst\s*(headache|pain)', r'thunderclap', r'neck\s*stiff',
                r'sudden.*headache', r'worst.*life',
            ],
            'cardiac_critical': [
                r'crushing.*chest', r'chest\s*pain.*(arm|jaw|diaphor)',
                r'pulseless', r'syncope.*thready', r'paradoxical.*chest',
            ],
            'airway_anaphylaxis': [
                r'stridor', r'lip.*swell', r'tongue.*swell', r'anaphylax',
                r'silent\s*chest', r'choking.*drool', r'carbonaceous.*sputum',
            ],
            'overdose_toxic': [
                r'pinpoint\s*pupil', r'empty.*(bottle|oxycodone|pill)',
                r'respiratory\s*rate\s*([4-8]\b)', r'ingested.*bleach',
            ],
            'high_risk_ob_surgical': [
                r'vaginal\s*bleed.*(rigid|cramp|30\s*week|gestat)',
                r'pelvic\s*pain.*(pregnan|home\s*test)', r'ectopic',
                r'testicular\s*pain', r'scrotal.*swell', r'ripping\s*back',
                r'charcot', r'jaundice.*tenderness', r'chemotherapy.*fever',
            ],
            'sepsis': [
                r'fever.*confused', r'altered.*mental', r'hypotherm.*confusion',
                r'rigors', r'chills.*fever', r'purpuric\s*rash',
            ],
        }

    def extract(self, chief_complaint: str) -> dict:
        text = chief_complaint.lower()
        key_phrases = []
        negations = []
        semantic_flags = []

        max_score = 0.0
        max_tier = 'non_urgent'

        # 1. Regex Semantic Pattern Matching
        for pattern_name, patterns in self.semantic_patterns.items():
            for pat in patterns:
                if re.search(pat, text):
                    semantic_flags.append(pattern_name)
                    break

        # 2. Lexicon Tier Scoring with Clause-Aware Negation
        for tier, data in self.lexicon.items():
            for term in data['terms']:
                if term in text:
                    term_idx = text.find(term)
                    raw_window = text[max(0, term_idx - 30):term_idx]
                    clause_parts = re.split(r'[,;.]', raw_window)
                    window_text = clause_parts[-1] if clause_parts else raw_window

                    is_negated = False
                    for neg in self.negation_terms:
                        if re.search(rf'\b{re.escape(neg)}\b', window_text):
                            is_negated = True
                            negations.append(f"{neg} {term}")
                            break

                    if not is_negated:
                        key_phrases.append(term)
                        if data['score'] > max_score:
                            max_score = data['score']
                            max_tier = tier

        # 3. Semantic Flag Overrides
        critical_flags = {'coma_unresponsive', 'status_epilepticus', 'stroke', 'sah', 'cardiac_critical', 'airway_anaphylaxis'}
        high_flags = {'overdose_toxic', 'high_risk_ob_surgical', 'sepsis'}

        if critical_flags & set(semantic_flags):
            max_score = max(max_score, 0.98)
            max_tier = 'critical'
        elif high_flags & set(semantic_flags):
            max_score = max(max_score, 0.82)
            if max_tier in ['moderate', 'minor', 'non_urgent']:
                max_tier = 'high'

        if not key_phrases and max_score == 0.0:
            max_score = 0.12
            max_tier = 'non_urgent'

        return {
            'urgency_score': max_score,
            'urgency_level': max_tier,
            'key_phrases': list(set(key_phrases)),
            'semantic_flags': list(set(semantic_flags)),
            'negations': list(set(negations)),
        }
