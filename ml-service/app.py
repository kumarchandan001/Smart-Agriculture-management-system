# app.py
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from ml.train import train_and_save
from ml.predict import predict_single

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "data", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Smart Agri ML Service", version="1.0")

class PredictRequest(BaseModel):
    crop: str
    ideal_n: float
    ideal_p: float
    ideal_k: float
    ideal_ph: str | None = None
    temp_c: float | None = None
    rainfall_mm: float | None = None

@app.post("/predict")
def predict(req: PredictRequest):
    """
    Accepts JSON body matching PredictRequest.
    Returns: { predicted_yield, model_version }
    """
    try:
        out = predict_single(req.dict())
        return out
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train(dataset: UploadFile | None = File(None)):
    """
    If a CSV file is uploaded in field 'dataset', save it and train on it.
    If no file is uploaded, train on default dataset under ml-service/data/.
    This endpoint runs training synchronously (blocking).
    """
    try:
        dataset_path = None
        if dataset is not None:
            # Ensure CSV
            filename = dataset.filename
            if not filename.lower().endswith('.csv'):
                raise HTTPException(status_code=400, detail="Only CSV files are accepted")
            save_name = f"{os.getpid()}_{filename.replace(' ', '_')}"
            save_path = os.path.join(UPLOAD_DIR, save_name)
            with open(save_path, 'wb') as f:
                content = await dataset.read()
                f.write(content)
            dataset_path = save_path

        # call train_and_save
        res = train_and_save(dataset_path)
        return JSONResponse(content=res)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5001, reload=True)
