import base64
import numpy as np
import cv2


def decode_base64_image(image_base64: str) -> np.ndarray:
    """
    Convert a base64 string into an image array.
    
    The frontend captures a camera frame and sends it as base64 text.
    This function converts that text back into an image OpenCV can read.
    """
    # Remove header if present (e.g. "data:image/jpeg;base64,")
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]

    # Decode base64 string to bytes
    image_bytes = base64.b64decode(image_base64)

    # Convert bytes to numpy array
    np_array = np.frombuffer(image_bytes, dtype=np.uint8)

    # Decode numpy array to actual image
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    return image


def preprocess_image(image: np.ndarray) -> np.ndarray:
    """
    Prepare image for MediaPipe processing.
    MediaPipe expects RGB format but OpenCV loads as BGR.
    """
    # Convert BGR → RGB
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image_rgb