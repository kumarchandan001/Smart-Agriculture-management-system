# ml/features.py
import pandas as pd
import numpy as np

def clean_and_prepare_df(df):
    """
    Basic cleaning and feature engineering.
    - Ensures numeric columns exist
    - Encodes crop to categorical code (we will save categories in the model artifact)
    - Converts ideal_ph like "5.5-6.5" to mean numeric ph
    """
    df = df.copy()

    # Drop completely empty rows
    df = df.dropna(how='all')

    # Ensure crop and target exist
    df = df.dropna(subset=['crop', 'expected_yield_ton_per_hectare'], how='any')

    # numeric columns
    for col in ['ideal_n', 'ideal_p', 'ideal_k']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        else:
            df[col] = np.nan

    # ph numeric: parse string ranges like "5.5-6.5" -> mean
    def ph_to_num(val):
        try:
            if pd.isna(val): 
                return np.nan
            if isinstance(val, str) and '-' in val:
                a, b = val.split('-')
                return (float(a.strip()) + float(b.strip())) / 2.0
            return float(val)
        except:
            return np.nan

    if 'ideal_ph' in df.columns:
        df['ph_num'] = df['ideal_ph'].apply(ph_to_num)
    else:
        df['ph_num'] = np.nan

    # Fill numeric NaNs with medians
    for col in ['ideal_n', 'ideal_p', 'ideal_k', 'ph_num']:
        if col in df.columns:
            med = df[col].median()
            if pd.isna(med):
                med = 0.0
            df[col] = df[col].fillna(med)

    # Crop code
    df['crop_code'] = df['crop'].astype('category').cat.codes

    return df
