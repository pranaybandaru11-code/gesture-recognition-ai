import httpx
from typing import Dict, Any


class MLServiceClient:
    """
    Client for communicating with the ML service.
    Handles all prediction requests and error handling.
    """

    def __init__(self, base_url: str = "http://ml-service:8001"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=10.0)

    async def predict(self, image_base64: str) -> Dict[str, Any]:
        """Send image to ML service for gesture prediction."""
        try:
            response = await self.client.post(
                f"{self.base_url}/predict",
                json={"image_base64": image_base64},
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"ML Service error: {e}")
            return {
                "gesture_name": "error",
                "confidence": 0.0,
                "latency_ms": 0,
                "hand_detected": False,
            }

    async def predict_face(self, image_base64: str) -> Dict[str, Any]:
        """Send image to ML service for face direction prediction."""
        try:
            response = await self.client.post(
                f"{self.base_url}/predict-face",
                json={"image_base64": image_base64},
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"ML Service error: {e}")
            return {
                "direction": "error",
                "mouth_open": False,
                "confidence": 0.0,
                "latency_ms": 0,
                "face_detected": False,
            }

    async def health_check(self) -> bool:
        """Check if ML service is healthy."""
        try:
            response = await self.client.get(f"{self.base_url}/health")
            return response.status_code == 200
        except Exception:
            return False


# Singleton instance
ml_client = MLServiceClient()