import json
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

def generate_synthetic_data(n_samples=10000):
    np.random.seed(42)
    
    age = np.random.randint(1, 96, n_samples)
    sex = np.random.randint(0, 2, n_samples)
    arrival_mode = np.random.randint(0, 2, n_samples)
    
    hr = np.zeros(n_samples, dtype=int)
    sbp = np.zeros(n_samples, dtype=int)
    dbp = np.zeros(n_samples, dtype=int)
    spo2 = np.random.randint(72, 101, n_samples)
    rr = np.random.randint(8, 48, n_samples)
    temp = np.random.uniform(35.0, 41.0, n_samples)
    pain = np.random.randint(0, 11, n_samples)
    
    # Age-appropriate physiological distributions
    for i in range(n_samples):
        if age[i] <= 3:  # Toddler
            hr[i] = np.random.randint(90, 175)
            sbp[i] = np.random.randint(65, 115)
            dbp[i] = np.random.randint(40, 75)
        elif age[i] <= 12:  # Child
            hr[i] = np.random.randint(70, 150)
            sbp[i] = np.random.randint(75, 130)
            dbp[i] = np.random.randint(45, 85)
        elif age[i] >= 65:  # Geriatric
            hr[i] = np.random.randint(45, 140)
            sbp[i] = np.random.randint(75, 210)
            dbp[i] = np.random.randint(45, 115)
        else:  # Adult
            hr[i] = np.random.randint(45, 170)
            sbp[i] = np.random.randint(65, 195)
            dbp[i] = np.random.randint(40, 115)

    shock_index = hr / np.where(sbp == 0, 1, sbp)
    
    mews = np.zeros(n_samples)
    mews += np.where((rr <= 8) | (rr >= 30), 3, 0)
    mews += np.where((hr <= 40) | (hr >= 130), 3, 0)
    mews += np.where(sbp <= 70, 3, 0)
    
    map_val = (sbp + 2 * dbp) / 3
    
    labels = np.zeros(n_samples, dtype=int)
    for i in range(n_samples):
        # 3% realistic label noise
        if np.random.rand() < 0.03:
            labels[i] = np.random.randint(1, 6)
            continue
            
        is_peds = age[i] <= 12
        crit_si = 1.9 if is_peds else 1.4
        crit_sbp = 65 if is_peds else 75
        crit_spo2 = 86
        
        # ESI-1: Immediate life threat
        if spo2[i] < crit_spo2 or sbp[i] < crit_sbp or (hr[i] > 165 and sbp[i] < 80) or shock_index[i] > crit_si or mews[i] >= 8:
            labels[i] = 1
        # ESI-2: High acuity / Emergent (threat to life/limb, high vitals)
        elif spo2[i] < 92 or sbp[i] < (80 if is_peds else 90) or shock_index[i] > (1.3 if is_peds else 1.05) or mews[i] >= 4 or temp[i] >= 39.2 or (pain[i] >= 8 and (hr[i] > 110 or sbp[i] > 160)):
            labels[i] = 2
        # ESI-3: Urgent / Multiple resources (moderate pain 5-7, moderate fever 38.0-39.1, moderate vitals)
        elif pain[i] >= 5 or temp[i] >= 38.0 or hr[i] > 105 or rr[i] >= 20:
            labels[i] = 3
        # ESI-4: Less urgent / Single resource (mild pain 3-4, minor symptoms)
        elif 2 <= pain[i] <= 4 or temp[i] > 37.3:
            labels[i] = 4
        # ESI-5: Non-urgent / OPD (no vitals abnormality, pain 0-1)
        else:
            labels[i] = 5
            
    df = pd.DataFrame({
        'age': age, 'sex': sex, 'hr': hr, 'sbp': sbp, 'dbp': dbp,
        'spo2': spo2, 'rr': rr, 'temp': temp, 'pain': pain,
        'arrival_mode': arrival_mode, 'shock_index': shock_index,
        'mews': mews, 'map': map_val
    })
    
    return df, labels

def train():
    print("Generating clinically calibrated synthetic cohort (N=10,000)...")
    X, y = generate_synthetic_data(10000)
    y = y - 1
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Asymmetric safety weighting to guarantee low under-triage
    sample_weights = np.ones(len(y_train))
    sample_weights[y_train == 0] = 4.0  # ESI-1
    sample_weights[y_train == 1] = 2.5  # ESI-2
    sample_weights[y_train == 2] = 1.8  # ESI-3
    sample_weights[y_train == 3] = 1.0  # ESI-4
    sample_weights[y_train == 4] = 1.0  # ESI-5
    
    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.07,
        objective='multi:softprob',
        num_class=5,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )
    
    print("Training XGBoost Multi-Class Classifier...")
    model.fit(X_train, y_train, sample_weight=sample_weights)
    
    preds = model.predict(X_test)
    print("\nClassification Report (20% Test Split):")
    print(classification_report(y_test, preds, target_names=['ESI-1', 'ESI-2', 'ESI-3', 'ESI-4', 'ESI-5']))
    
    # Save model
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'xgb_model.json')
    feature_path = os.path.join(current_dir, 'feature_names.json')
    
    model.save_model(model_path)
    with open(feature_path, 'w') as f:
        json.dump(list(X.columns), f)
        
    print(f"Model saved to {model_path}")
    print(f"Features saved to {feature_path}")

if __name__ == '__main__':
    train()
