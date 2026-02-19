from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel

from app.models.gesture_classifier import GestureClassifier
from app.models.face_classifier import FaceClassifier
from app.utils.image_processor import decode_base64_image, preprocess_image

# Global instances
gesture_classifier = None
face_classifier = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global gesture_classifier, face_classifier
    print("🤖 Loading classifiers...")
    gesture_classifier = GestureClassifier()
    face_classifier = FaceClassifier()
    print("✅ Classifiers ready!")
    yield
    print("👋 Shutting down...")
    gesture_classifier.close()
    face_classifier.close()


app = FastAPI(
    title="Gesture & Face Recognition ML Service",
    version="1.0.0",
    lifespan=lifespan,
)


class PredictionRequest(BaseModel):
    image_base64: str


@app.post("/predict")
async def predict_gesture(request: PredictionRequest):
    image = decode_base64_image(request.image_base64)
    image_rgb = preprocess_image(image)
    result = gesture_classifier.predict(image_rgb)
    return result


@app.post("/predict-face")
async def predict_face(request: PredictionRequest):
    image = decode_base64_image(request.image_base64)
    image_rgb = preprocess_image(image)
    result = face_classifier.predict(image_rgb)
    return result


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gesture_model_loaded": gesture_classifier is not None,
        "face_model_loaded": face_classifier is not None,
    }