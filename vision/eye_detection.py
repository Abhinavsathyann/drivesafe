"""
DriveSafe AI — Eye Landmark Localization Interface
Phase 1 Architectural Contract (Implementation reserved for Phase 3)
"""

from typing import Optional, Tuple, Dict, Any


class EyeDetectorInterface:
    """
    Abstract contract for extracting ocular regions of interest (ROI)
    from a detected facial frame.
    """

    def __init__(self):
        self.is_initialized = False

    def initialize(self) -> bool:
        """Initializes eye landmark extraction models."""
        raise NotImplementedError("Eye localization will be implemented in Phase 3.")

    def extract_eyes(
        self, frame: Any, face_box: Dict[str, int]
    ) -> Tuple[Optional[Any], Optional[Any]]:
        """
        Extracts cropped image patches for left and right eyes.
        Returns:
            (left_eye_patch, right_eye_patch)
        """
        raise NotImplementedError("Eye extraction will be implemented in Phase 3.")
