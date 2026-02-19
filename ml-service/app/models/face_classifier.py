import time
import mediapipe as mp
import numpy as np


class FaceClassifier:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.7,
        )

    def predict(self, image_rgb: np.ndarray) -> dict:
        start_time = time.time()
        results = self.face_mesh.process(image_rgb)
        latency_ms = (time.time() - start_time) * 1000

        if not results.multi_face_landmarks:
            return {
                "direction": "no_face",
                "mouth_open": False,
                "confidence": 0.0,
                "latency_ms": round(latency_ms, 2),
                "face_detected": False,
            }

        landmarks = results.multi_face_landmarks[0].landmark

        # Key facial landmarks
        nose_tip = landmarks[1]
        left_eye = landmarks[33]
        right_eye = landmarks[263]
        upper_lip = landmarks[13]
        lower_lip = landmarks[14]

        # Calculate face center
        face_center_x = (left_eye.x + right_eye.x) / 2
        face_center_y = (left_eye.y + right_eye.y) / 2

        # Detect head direction based on nose position relative to eye center
        nose_offset_x = nose_tip.x - face_center_x
        nose_offset_y = nose_tip.y - face_center_y

        direction = "center"
        confidence = 0.7

        # Horizontal direction (left/right)
        if nose_offset_x < -0.02:
            direction = "left"
            confidence = min(0.95, 0.7 + abs(nose_offset_x) * 5)
        elif nose_offset_x > 0.02:
            direction = "right"
            confidence = min(0.95, 0.7 + abs(nose_offset_x) * 5)

        # Vertical direction (up/down)
        if nose_offset_y < -0.03:
            direction = "up"
            confidence = min(0.95, 0.7 + abs(nose_offset_y) * 5)
        elif nose_offset_y > 0.02:
            direction = "down"
            confidence = min(0.95, 0.7 + abs(nose_offset_y) * 5)

        # Detect mouth open
        mouth_distance = abs(upper_lip.y - lower_lip.y)
        mouth_open = mouth_distance > 0.02

        return {
            "direction": direction,
            "mouth_open": mouth_open,
            "confidence": round(confidence, 2),
            "latency_ms": round(latency_ms, 2),
            "face_detected": True,
        }

    def close(self):
        self.face_mesh.close()