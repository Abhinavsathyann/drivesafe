"""
DriveSafe AI — Phase 2 Flask Backend Entry Point
Academic Prototype: Real-Time Driver Drowsiness Monitoring
BCA College Final Year Project
"""

import os
from flask import Flask, render_template, jsonify, request

app = Flask(__name__, template_folder="templates", static_folder="static")

# Phase 2 System State (No fake ML predictions; real camera status tracking)
SYSTEM_STATE = {
    "cameraConnected": False,
    "monitoring": False,
    "faceDetected": False,
    "leftEyeState": "UNKNOWN",
    "rightEyeState": "UNKNOWN",
    "eyeClosureDuration": 0.0,
    "mlConfidence": None,
    "drowsinessRisk": "NOT_MONITORING",
    "alertActive": False,
    "thresholdSeconds": 5.0,
    "sessionStartTime": None,
    "cameraStatus": "NOT_CONNECTED",
    "cameraPermission": "UNKNOWN",
    "cameraError": None,
    "faceStatus": "WAITING",
    "eyeStatus": "WAITING",
    "activeError": None,
    "videoReady": False,
    "videoWidth": 0,
    "videoHeight": 0,
    "streamActive": False,
    "targetFPS": 10,
    "measuredFPS": 0,
    "framesCaptured": 0,
    "phase": 2,
}

DEFAULT_SETTINGS = {
    "thresholdSeconds": 5.0,
    "alertSound": True,
    "alertVolume": 80,
    "cameraDevice": "default",
    "mirrorCamera": True,
    "targetFPS": 10,
    "confidenceThreshold": 0.80,  # Reserved for future ML (Phase 5/6)
}

CURRENT_SETTINGS = DEFAULT_SETTINGS.copy()


@app.route("/")
def index():
    """Renders the main Phase 2 HTML dashboard."""
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint confirming Phase 2 backend availability."""
    return jsonify({
        "status": "healthy",
        "phase": 2,
        "name": "DriveSafe AI",
        "prototype": True,
        "pipeline": "real-time-browser-webcam",
        "disclaimer": "Educational prototype — Not a certified automotive safety system."
    })


@app.route("/api/status", methods=["GET"])
def get_status():
    """Returns the current centralized system state."""
    return jsonify(SYSTEM_STATE)


@app.route("/api/settings", methods=["GET", "POST"])
def handle_settings():
    """Handles retrieval and updates of application settings."""
    global CURRENT_SETTINGS
    if request.method == "POST":
        data = request.get_json() or {}
        CURRENT_SETTINGS.update(data)
        if "thresholdSeconds" in data:
            SYSTEM_STATE["thresholdSeconds"] = float(data["thresholdSeconds"])
        if "targetFPS" in data:
            SYSTEM_STATE["targetFPS"] = int(data["targetFPS"])
        return jsonify({"status": "success", "settings": CURRENT_SETTINGS})
    return jsonify(CURRENT_SETTINGS)


@app.route("/api/session/stats", methods=["GET"])
def get_session_stats():
    """
    Returns baseline session statistics.
    In Phase 1 & 2, metrics are initialized to empty/baseline states.
    """
    return jsonify({
        "monitoringDuration": "00:00",
        "drowsinessEvents": 0,
        "longestEyeClosure": "—",
        "averageConfidence": "—",
        "sessionActive": False
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
