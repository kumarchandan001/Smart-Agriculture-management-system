# ml/train.py
import os
import datetime
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
from .features import clean_and_prepare_df
import stat

BASE = os.path.dirname(__file__)
MODEL_DIR = os.path.join(BASE, "model")
if os.path.exists(MODEL_DIR) and os.path.isfile(MODEL_DIR):
    os.remove(MODEL_DIR)
os.makedirs(MODEL_DIR, exist_ok=True)

DEFAULT_DATA_PATH = os.path.join(BASE, "..", "data", "crop_500_dataset.csv")

def train_and_save(dataset_path: str = None, n_estimators:int = 200, random_state:int = 42):
    """
    Trains a RandomForest model and saves artifact with metadata.
    Returns dict: { model_path, version, r2, rmse, features, categories }
    """
    if dataset_path is None:
        dataset_path = DEFAULT_DATA_PATH

    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Dataset not found at {dataset_path}")

    df = pd.read_csv(dataset_path)
    df = clean_and_prepare_df(df)

    # features
    features = ['ideal_n', 'ideal_p', 'ideal_k', 'crop_code', 'ph_num']
    # ensure env columns present if available
    for env in ['temp_c','rainfall_mm','humidity']:
        if env in df.columns:
            features.append(env)
            df[env] = pd.to_numeric(df[env], errors='coerce').fillna(df[env].median())

    X = df[features]
    y = pd.to_numeric(df['expected_yield_ton_per_hectare'], errors='coerce').fillna(0.0)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=random_state)

    model = RandomForestRegressor(n_estimators=n_estimators, random_state=random_state, n_jobs=-1)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    import math
    r2 = float(r2_score(y_test, preds))
    rmse = float(math.sqrt(mean_squared_error(y_test, preds)))

    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%S")
    version = f"crop_yield_v1_{ts}"
    model_path = os.path.join(MODEL_DIR, f"{version}.pkl")

    # Save model artifact: include model, features, version, crop categories
    artifact = {
        'model': model,
        'features': features,
        'version': version,
        'categories': {
            'crop': list(df['crop'].astype('category').cat.categories)
        }
    }
    joblib.dump(artifact, model_path)

    return {
        'model_path': model_path,
        'version': version,
        'r2': r2,
        'rmse': rmse,
        'features': features
    }

if __name__ == "__main__":
    print("Training with default dataset...")
    res = train_and_save()
    print("Completed:", res)
