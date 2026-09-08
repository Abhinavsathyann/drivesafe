"""
DriveSafe AI — Computer Vision Face Detection Interface
Phase 1 Architectural Contract (Implementation reserved for Phase 3)
"""

from typing import Optional, Tuple, Dict, Any


class FaceDetectorInterface:
    """
    Abstract contract for face detection subsystem.
    In Phase 3, this will be implemented using OpenCV Haar Cascades
    or MediaPipe Face Mesh.
    """

    def __init__(self, min_detection_confidence: float = 0.5):
        self.min_detection_confidence = min_detection_confidence
        self.is_initialized = False

    def initialize(self) -> bool:
        """
        Loads Haar cascade classifiers or initializes MediaPipe Face Mesh.
        Reserved for Phase 3.
        """
        raise NotImplementedError("Face detection pipeline will be implemented in Phase 3.")

    def detect_face(self, frame: Any) -> Tuple[bool, Optional[Dict[str, int]]]:
        """
        Receives an image frame (NumPy array).
        Returns:
            (face_detected: bool, bounding_box: Optional[Dict[str, int]])
            where bounding_box has keys: {'x', 'y', 'w', 'h'}
        """
        raise NotImplementedError("Face detection will be implemented in Phase 3.")
