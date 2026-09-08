"""
DriveSafe AI — Image Preprocessing Interface
Phase 1 Architectural Contract (Implementation reserved for Phase 4)
"""

from typing import Tuple, Any


class EyePreprocessorInterface:
    """
    Abstract contract for preparing cropped eye patches for ML model input.
    """

    TARGET_SIZE: Tuple[int, int] = (24, 24)

    def preprocess(self, eye_patch: Any) -> Any:
        """
        Applies grayscale conversion, histogram equalization / normalization,
        and resizing to the expected CNN input shape (e.g. 24x24x1).
        """
        raise NotImplementedError("Image preprocessing pipeline will be implemented in Phase 4.")
