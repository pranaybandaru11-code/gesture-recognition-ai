import time
import mediapipe as mp
import numpy as np


class GestureClassifier:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5,
        )

    def _get_finger_states(self, landmarks):
        """
        Returns which fingers are up/extended.
        Returns: [thumb, index, middle, ring, pinky] — True = up
        """
        fingers = []

        # Thumb — compare tip x vs IP joint x
        # Works for both left and right hand
        thumb_tip = landmarks[4]
        thumb_ip = landmarks[3]
        thumb_mcp = landmarks[2]
        wrist = landmarks[0]

        # Detect if hand is left or right based on wrist vs middle finger base
        hand_facing_right = landmarks[17].x < landmarks[5].x

        if hand_facing_right:
            thumb_up = thumb_tip.x > thumb_ip.x
        else:
            thumb_up = thumb_tip.x < thumb_ip.x

        fingers.append(thumb_up)

        # Other 4 fingers — tip y vs PIP joint y (up = smaller y)
        tips = [8, 12, 16, 20]
        pips = [6, 10, 14, 18]

        for tip, pip in zip(tips, pips):
            fingers.append(landmarks[tip].y < landmarks[pip].y)

        return fingers  # [thumb, index, middle, ring, pinky]

    def _classify(self, landmarks):
        f = self._get_finger_states(landmarks)
        thumb, index, middle, ring, pinky = f
        count = sum(f)

        # ── Specific gestures first ──────────────────────
        # Fist: all fingers closed
        if count == 0:
            return "fist", 0.96

        # Open hand: all fingers open
        if count == 5:
            return "open_hand", 0.95

        # Pointing: only index up
        if f == [False, True, False, False, False]:
            return "pointing", 0.94

        # Peace/Victory: index + middle up
        if f == [False, True, True, False, False]:
            return "peace", 0.93

        # Thumbs up: only thumb up
        if f == [True, False, False, False, False]:
            return "thumbs_up", 0.94

        # Thumbs down: thumb down, others closed
        if f == [False, False, False, False, False]:
            return "fist", 0.90

        # Pinky/Call me: thumb + pinky up
        if f == [True, False, False, False, True]:
            return "pinky", 0.91

        # Rock: index + pinky up
        if f == [False, True, False, False, True]:
            return "rock", 0.92

        # Three fingers: index + middle + ring
        if f == [False, True, True, True, False]:
            return "three", 0.89

        # Four fingers: all except thumb
        if f == [False, True, True, True, True]:
            return "four", 0.88

        # OK sign approximation: thumb + index up, others closed
        if f == [True, True, False, False, False]:
            return "ok", 0.85

        # ── Fallback ─────────────────────────────────────
        if count == 1:
            return "pointing", 0.70
        if count >= 4:
            return "open_hand", 0.75

        return "unknown", 0.50

    def predict(self, image_rgb: np.ndarray) -> dict:
        start_time = time.time()
        results = self.hands.process(image_rgb)
        latency_ms = (time.time() - start_time) * 1000

        if not results.multi_hand_landmarks:
            return {
                "gesture_name": "no_hand",
                "confidence": 0.0,
                "latency_ms": round(latency_ms, 2),
                "hand_detected": False,
            }

        landmarks = results.multi_hand_landmarks[0].landmark
        gesture_name, confidence = self._classify(landmarks)

        return {
            "gesture_name": gesture_name,
            "confidence": confidence,
            "latency_ms": round(latency_ms, 2),
            "hand_detected": True,
        }

    def close(self):
        self.hands.close()