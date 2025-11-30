import joblib
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_PATH = "model/trained_model.joblib"
ORIGINS = [
    "http://localhost:5173",  # Vite's default port
    "http://127.0.0.1:5173",
]

app = FastAPI(title="Language Recognizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists(MODEL_PATH):
    print(f"Loading model from: {MODEL_PATH}...")
    try:
        model_pipeline = joblib.load(MODEL_PATH)
        print("Model loaded successfully!")
    except Exception as e:
        print(f"ERROR while trying to load model. {e}")
        model_pipeline = None
else:
    print(f"WARN: Model file not found at {MODEL_PATH}.")
    model_pipeline = None


class TextPayload(BaseModel):
    text: str


class PredictionResult(BaseModel):
    language: str
    confidence: float
    is_code: bool


@app.get("/")
def health_check():
    return {"status": "running", "model_loaded": model_pipeline is not None}


@app.post("/detect", response_model=PredictionResult)
def detect_language(payload: TextPayload):
    if model_pipeline is None:
        raise HTTPException(status_code=500, detail="Model not loaded on server.")

    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    try:
        prediction = model_pipeline.predict([payload.text])[0]

        probabilities = model_pipeline.predict_proba([payload.text])
        confidence = float(probabilities.max())

        natural_langs = [
            "ar",
            "bg",
            "de",
            "el",
            "en",
            "es",
            "fr",
            "hi",
            "it",
            "ja",
            "nl",
            "pl",
            "pt",
            "ru",
            "sw",
            "th",
            "tr",
            "ur",
            "vi",
            "zh",
        ]
        is_code = prediction not in natural_langs

        return {"language": prediction, "confidence": confidence, "is_code": is_code}

    except Exception as e:
        print(f"Error in prediction: {e}")
        raise HTTPException(
            status_code=500, detail="Internal error while processing prediction."
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
