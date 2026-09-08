"""
DriveSafe AI — ML Eye State Predictor Interface
Phase 1 Architectural Contract (Implementation reserved for Phase 6)
"""

from typing import Dict, Any, Union


class EyeStatePredictorInterface:
    """
    Contract for supervised deep-learning model inference.
    Classifies preprocessed eye patches into OPEN or CLOSED states.
    """

    CLASS_OPEN = "OPEN"
    CLASS_CLOSED = "CLOSED"

    def __init__(self, model_path: str = "ml/model/drowsiness_cnn.h5"):
        self.model_path = model_path
        self.is_loaded = False

    def load_model(self) -> bool:
        """Loads trained Keras/TensorFlow model into memory."""
        raise NotImplementedError("ML inference will be integrated in Phase 6.")

    def predict_eye_state(self, preprocessed_patch: Any) -> Dict[str, Union[str, float]]:
        """
        Runs model inference.
        Returns:
            {
                "state": "OPEN" | "CLOSED",
                "confidence": float (0.0 to 1.0)
            }
        """
        raise NotImplementedError("ML inference will be integrated in Phase 6.")
