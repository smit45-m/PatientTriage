import json
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import os

def generate_synthetic_data(n_samples=5000):
    np.random.seed(42)
    
    age = np.random.randint(1, 96, n_samples)
    sex = np.random.randint(0, 2, n_samples)
    hr = np.random.randint(40, 201, n_samples)
    sbp = np.random.randint(50, 201, n_samples)
    dbp = np.random.randint(30, 121, n_samples)
    spo2 = np.random.randint(70, 101, n_samples)
    rr = np.random.randint(8, 46, n_samples)
    temp = np.random.uniform(35.0, 41.0, n_samples)
    pain = np.random.randint(0, 11, n_samples)
    arrival_mode = np.random.randint(0, 2, n_samples)
    
    shock_index = hr / np.where(sbp == 0, 1, sbp)
    
    mews = np.zeros(n_samples)
    mews += np.where((rr <= 8) | (rr >= 30), 3, 0)
    mews += np.where((hr <= 40) | (hr >= 130), 3, 0)
    mews += np.where(sbp <= 70, 3, 0)
    
    map_val = (sbp + 2 * dbp) / 3
    
    labels = np.zeros(n_samples, dtype=int)
    for i in range(n_samples):
        # noise 10%
        if np.random.rand() < 0.1:
            labels[i] = np.random.randint(1, 6)
            continue
            
        if spo2[i] < 88 or sbp[i] < 70 or (hr[i] > 150 and sbp[i] < 90) or shock_index[i] > 1.3:
            labels[i] = 1
        elif spo2[i] < 92 or sbp[i] < 85 or shock_index[i] > 1.0 or mews[i] >= 5:
            labels[i] = 2
        elif pain[i] >= 7 or temp[i] > 39 or hr[i] > 120 or rr[i] > 25:
            labels[i] = 3
        elif 4 <= pain[i] <= 6:
            labels[i] = 4
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
    print("Generating synthetic data...")
    X, y = generate_synthetic_data(5000)
    # y is 1-5, xgboost expects 0-4
    y = y - 1
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 20x under-triage penalty - giving more weight to lower ESI (which are 0 and 1 in zero-indexed)
    sample_weights = np.ones(len(y_train))
    sample_weights[y_train == 0] = 20.0  # ESI 1
    sample_weights[y_train == 1] = 15.0  # ESI 2
    
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        objective='multi:softprob',
        num_class=5,
        random_state=42
    )
    
    print("Training model...")
    model.fit(X_train, y_train, sample_weight=sample_weights)
    
    preds = model.predict(X_test)
    print("\nClassification Report:")
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
