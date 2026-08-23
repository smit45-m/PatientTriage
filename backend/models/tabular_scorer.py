import json
import os
import numpy as np
import xgboost as xgb

class TabularScorer:
    def __init__(self, model_path=None):
        self.features_order = [
            'age', 'sex', 'hr', 'sbp', 'dbp', 'spo2', 'rr', 'temp', 
            'pain', 'arrival_mode', 'shock_index', 'mews', 'map'
        ]
        
        self.medians = {
            'age': 45, 'sex': 0, 'hr': 80, 'sbp': 120, 'dbp': 80, 
            'spo2': 98, 'rr': 16, 'temp': 37.0, 'pain': 0, 
            'arrival_mode': 0, 'shock_index': 0.67, 'mews': 0, 'map': 93.3
        }
        
        self.model = None
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        if model_path is None:
            model_path = os.path.join(current_dir, 'xgb_model.json')
            
        if os.path.exists(model_path):
            self.model = xgb.XGBClassifier()
            self.model.load_model(model_path)
            
    def _prepare_features(self, features: dict) -> list:
        row = []
        for f in self.features_order:
            val = features.get(f)
            if val is None or np.isnan(val):
                val = self.medians[f]
            row.append(val)
        return row

    def predict(self, features: dict) -> dict:
        if self.model is None:
            return self._rule_based_fallback(features)
            
        row = self._prepare_features(features)
        X = np.array([row])
        
        probs = self.model.predict_proba(X)[0]
        pred_class = int(np.argmax(probs))
        confidence = float(np.max(probs))
        
        # XGBoost feature importances (global, not instance specific SHAP here as fallback)
        importances = self.model.feature_importances_
        feature_importance = {feat: float(imp) for feat, imp in zip(self.features_order, importances)}
        
        return {
            'esi_prediction': pred_class + 1,  # 0-indexed to 1-indexed
            'probabilities': [float(p) for p in probs],
            'confidence': confidence,
            'feature_importance': feature_importance
        }
        
    def _rule_based_fallback(self, features: dict) -> dict:
        hr = features.get('hr', self.medians['hr'])
        sbp = features.get('sbp', self.medians['sbp'])
        spo2 = features.get('spo2', self.medians['spo2'])
        rr = features.get('rr', self.medians['rr'])
        pain = features.get('pain', self.medians['pain'])
        temp = features.get('temp', self.medians['temp'])
        shock_index = features.get('shock_index', hr / sbp if sbp else 1)
        mews = features.get('mews', 0)
        
        esi = 5
        if spo2 < 88 or sbp < 70 or (hr > 150 and sbp < 90) or shock_index > 1.3:
            esi = 1
        elif spo2 < 92 or sbp < 85 or shock_index > 1.0 or mews >= 5:
            esi = 2
        elif pain >= 7 or temp > 39 or hr > 120 or rr > 25:
            esi = 3
        elif 4 <= pain <= 6:
            esi = 4
            
        probs = [0.0] * 5
        probs[esi - 1] = 0.85
        
        return {
            'esi_prediction': esi,
            'probabilities': probs,
            'confidence': 0.85,
            'feature_importance': {}
        }

    def get_shap_values(self, features: dict) -> dict:
        # Mock SHAP values for hackathon
        row = self._prepare_features(features)
        return {feat: float(abs(np.random.randn())) for feat in self.features_order}
