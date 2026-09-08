"""
DriveSafe AI — Architectural Verification Suite (Phase 1 & Phase 2)
Validates that Phase 1 & 2 file structures, camera pipeline contracts, and CV/ML interfaces exist.
"""

import os
import unittest

try:
    import flask
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False


class TestDriveSafeArchitecture(unittest.TestCase):
    def test_required_files_exist(self):
        required_files = [
            "app.py",
            "requirements.txt",
            "README.md",
            "templates/index.html",
            "static/css/style.css",
            "static/css/responsive.css",
            "static/js/camera.js",
            "static/js/state.js",
            "static/js/ui.js",
            "static/js/app.js",
            "vision/face_detection.py",
            "vision/eye_detection.py",
            "vision/preprocessing.py",
            "ml/inference/predictor.py",
            "src/services/camera.ts",
            "src/types/drivesafe.ts",
            "src/context/DriveSafeContext.tsx",
            "src/components/MonitorView.tsx",
            "src/components/DashboardView.tsx",
            "src/components/SettingsView.tsx",
        ]
        for path in required_files:
            self.assertTrue(os.path.exists(path), f"Missing architectural file: {path}")

    def test_phase2_camera_service_contract(self):
        """Verifies that the camera service contains all required methods & contracts."""
        with open("src/services/camera.ts", "r") as f:
            content = f.read()

        required_signatures = [
            "requestCameraStream",
            "stopCameraStream",
            "enumerateCameras",
            "parseCameraError",
            "FramePipelineManager",
            "captureCurrentFrame",
        ]
        for sig in required_signatures:
            self.assertIn(sig, content, f"Missing {sig} in src/services/camera.ts")

    def test_phase2_vanilla_js_camera_module(self):
        """Verifies that static/js/camera.js contains full camera engine."""
        with open("static/js/camera.js", "r") as f:
            content = f.read()

        required_signatures = [
            "DriveSafeCamera",
            "startStream",
            "stopStream",
            "startFramePipeline",
            "captureCurrentFrame",
            "enumerateDevices",
            "parseError",
        ]
        for sig in required_signatures:
            self.assertIn(sig, content, f"Missing {sig} in static/js/camera.js")

    def test_python_app_state_declaration(self):
        """Validates app.py contains the Phase 2 system state keys."""
        with open("app.py", "r") as f:
            content = f.read()

        required_keys = [
            '"cameraConnected"',
            '"monitoring"',
            '"cameraStatus"',
            '"cameraPermission"',
            '"videoReady"',
            '"videoWidth"',
            '"videoHeight"',
            '"streamActive"',
            '"targetFPS"',
            '"measuredFPS"',
            '"framesCaptured"',
            '"phase": 2',
        ]
        for key in required_keys:
            self.assertIn(key, content, f"Missing key {key} in app.py SYSTEM_STATE")

    @unittest.skipUnless(HAS_FLASK, "Flask not installed in local environment")
    def test_flask_app_initialization(self):
        import app
        client = app.app.test_client()
        response = client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data.get("phase"), 2)
        self.assertEqual(data.get("name"), "DriveSafe AI")

    @unittest.skipUnless(HAS_FLASK, "Flask not installed in local environment")
    def test_flask_status_endpoint_phase2_fields(self):
        import app
        client = app.app.test_client()
        response = client.get("/api/status")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data.get("cameraConnected"))
        self.assertEqual(data.get("cameraStatus"), "NOT_CONNECTED")
        self.assertEqual(data.get("cameraPermission"), "UNKNOWN")
        self.assertFalse(data.get("videoReady"))
        self.assertFalse(data.get("streamActive"))
        self.assertEqual(data.get("targetFPS"), 10)


if __name__ == "__main__":
    unittest.main()
