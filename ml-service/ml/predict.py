# ml/predict.py
import os
import joblib
import sys
BASE = os.path.dirname(os.path.abspath(__file__))
if BASE not in sys.path:
    sys.path.insert(0, BASE)

try:
    from .features import clean_and_prepare_df
except (ImportError, ValueError):
    try:
        from features import clean_and_prepare_df
    except ImportError:
        from ml.features import clean_and_prepare_df

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
_loaded = None

def _load_latest():
    global _loaded
    if _loaded is None:
        if not os.path.exists(MODEL_DIR):
            raise FileNotFoundError("Model directory not found. Train first.")
        files = [os.path.join(MODEL_DIR, f) for f in os.listdir(MODEL_DIR) if f.endswith('.pkl')]
        if not files:
            raise FileNotFoundError("No model found. Train first.")
        latest = max(files, key=os.path.getmtime)
        _loaded = joblib.load(latest)
    return _loaded

def predict_single(input_json: dict):
    meta = _load_latest()
    model = meta['model']
    features = meta['features']
    categories = meta.get('categories', {})

    # Build a single-row DataFrame matching features
    # Use helper to convert certain fields
    row = {}
    # crop_code
    crop = input_json.get('crop', '')
    crop_categories = categories.get('crop', [])
    crop_code = crop_categories.index(crop) if crop in crop_categories else 0
    row['crop_code'] = crop_code

    # ph
    ph = input_json.get('ideal_ph') or input_json.get('ph') or input_json.get('ph_num')
    def ph_to_float(phv):
        try:
            if isinstance(phv, str) and '-' in phv:
                a,b = phv.split('-')
                return (float(a) + float(b)) / 2.0
            return float(phv)
        except:
            return 0.0
    row['ph_num'] = ph_to_float(ph) if 'ph_num' in features else 0.0

    # numeric NPK and env
    for k in ['ideal_n','ideal_p','ideal_k','temp_c','rainfall_mm','humidity']:
        if k in features:
            row[k] = float(input_json.get(k, 0.0))

    # ensure feature order and fill missing with 0
    X = pd.DataFrame([row], columns=features).fillna(0.0)

    pred = model.predict(X)[0]
    return {
        'predicted_yield': float(round(float(pred), 3)),
        'model_version': meta.get('version', 'unknown')
    }
