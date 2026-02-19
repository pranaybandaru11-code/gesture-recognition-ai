import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket_manager import ws_manager
from app.services.ml_client import MLServiceClient

router = APIRouter()


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    Real-time WebSocket endpoint.
    Frontend connects here and sends camera frames continuously.
    We process each frame and send the gesture back instantly.
    """
    await ws_manager.connect(websocket, session_id)
    ml_client = MLServiceClient()

    try:
        while True:
            # Wait for image data from frontend
            data = await websocket.receive_json()
            image_base64 = data.get("image_base64")

            if not image_base64:
                await websocket.send_json({"error": "No image data received"})
                continue

            # Send to ML service for prediction
            result = await ml_client.predict(image_base64)

            if result:
                await websocket.send_json({
                    "gesture_name": result["gesture_name"],
                    "confidence": result["confidence"],
                    "latency_ms": result["latency_ms"],
                    "session_id": session_id,
                })
            else:
                await websocket.send_json({
                    "error": "ML service unavailable"
                })

    except WebSocketDisconnect:
        ws_manager.disconnect(session_id)