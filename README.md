# DriveSafe AI — Phase 3: Real-Time Computer Vision

**BCA College Final-Year Project Prototype**  
**Real-Time Driver Drowsiness Detection Using Computer Vision and Machine Learning**

---

## Academic Prototype Disclaimer

> **IMPORTANT**: This application is an academic/educational prototype and **NOT a certified automotive safety system**. It does not guarantee accident prevention, determine sleep with medical certainty, or replace professional driver-monitoring hardware. All video data is processed locally on the client machine to safeguard privacy.

---

## 1. Project Overview & Phase 3 Objective

DriveSafe AI investigates real-time driver drowsiness monitoring through webcam-based facial and eye-state analysis. The project is being developed across **10 strictly controlled phases**.

**Phase 3 establishes**:
* Real-time Face Detection and Facial Landmarking using browser-side MediaPipe Tasks Vision.
* Left and right eye localization using standard physical eye coordinate mapping.
* Eye bounding box extraction (crops) formatted as structured JSON for future ML classification.
* Zero-latency privacy architecture: No video frames are transmitted over the network for detection.
* Integration into the Phase 2 camera extraction pipeline at a configurable target FPS.
* Live "Vision Overlay" canvas for visualizing face bounding boxes, eye landmarks, and eye crop regions.
* Comprehensive UI diagnostics tracking face count, face quality, processing latency, and diagnostic EAR (Eye Aspect Ratio).

---

## 2. Project Directory Structure

```
drivesafe-ai/
│
├── app.py                      # Flask backend entry point & REST API endpoints
├── requirements.txt            # Python dependencies
├── README.md                   # Comprehensive project documentation & viva guide
├── metadata.json               # Platform manifest & permissions
├── package.json                # Frontend package manifest & scripts
│
├── templates/
│   └── index.html              # Primary semantic HTML5 interface for Flask
│
├── static/
│   ├── css/
│   │   ├── style.css           # Automotive dashboard styles & design tokens
│   │   └── responsive.css      # Responsive media queries
│   ├── js/
│   │   ├── state.js            # Centralized JavaScript state management
│   │   ├── ui.js               # UI rendering & DOM updates
│   │   ├── camera.js           # Hardware stream lifecycle & frame extraction (Phase 2)
│   │   ├── vision.js           # Browser-side MediaPipe FaceLandmarker logic (Phase 3)
│   │   └── app.js              # Application bootstrapper & event wiring
│   └── assets/                 # Static icons and assets
│
├── vision/
│   ├── face_detection.py       # Python backend structural stub
│   └── eye_detection.py        # Python backend structural stub
│
└── tests/
    └── test_architecture.py    # Architecture & contract unit test suite
```

---

## 3. Installation & Run Instructions

### Method: Running with Python & Flask (College Submission)

1. **Prerequisites**: Python 3.10+ installed.
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Start the Flask Application**:
   ```bash
   python app.py
   ```
   Open your browser and navigate to: `http://localhost:5000`

### Running the Architectural Tests:
```bash
python -m unittest tests/test_architecture.py
```

---

## 4. Architecture Note: Browser-Side Computer Vision

Although the project maintains a Python (`Flask`) backend and a structured `vision/` directory, **Phase 3 Face and Eye localization is executed entirely in the browser using MediaPipe FaceLandmarker via WebAssembly (Wasm)**. 

### Why Browser-Side Vision?
Transmitting raw video frames (at 10-30 FPS) to a Flask server over HTTP for Face Detection introduces unacceptable latency, high bandwidth consumption, and significant server load. By running the CV pipeline on the client:
1. **Latency is minimized** (sub-20ms processing time per frame).
2. **Privacy is guaranteed** (raw video never leaves the user's device).
3. The server is freed up to eventually handle the heavier Machine Learning classification (Phase 5/6) using small, cropped eye images instead of full video frames.

The `vision/face_detection.py` stub exists to preserve the intended backend architecture and will act as the REST endpoint handler when Phase 6 ML integration begins.

---

## 5. Implemented Features (Phase 1, 2, & 3)

* **Phase 1 (Architecture)**: High-contrast automotive UI, 10-phase project tracker, centralized state architecture, and active error-state diagnostics.
* **Phase 2 (Camera Pipeline)**: Secure webcam initialization, device enumeration, off-screen canvas frame extraction, and diagnostic FPS measurement.
* **Phase 3 (Computer Vision)**:
  * MediaPipe FaceLandmarker initialization with GPU delegation.
  * Detection of 0, 1, or Multiple faces.
  * Quality heuristics based on face distance/ratio.
  * Bounding box extraction with configurable padding for both Left and Right eyes.
  * Live overlay canvas for Face bounding box (Green) and Eye bounding boxes (Orange).
  * Diagnostic EAR calculation for validation.

---

## 6. Not-Yet-Implemented Features (Disciplined Phasing)

| Phase | Title | Scope & Status |
|---|---|---|
| **Phase 4** | Dataset Preparation | MRL Eye dataset ingestion, preprocessing, augmentation, and normalization. |
| **Phase 5** | ML Model Training | CNN training in TensorFlow/Keras for OPEN vs CLOSED binary classification. |
| **Phase 6** | Real-Time ML Inference | Connecting model weights to extracted eye crops, producing real confidence scores. |
| **Phase 7** | Temporal Engine & Alerts | Continuous 5.0-second closure accumulator, audio buzzer synthesis, alert trigger. |
| **Phase 8** | Analytics & Session History | Telemetry recording, Recharts/D3 time-series graphs, vigilance scoring. |
| **Phase 9** | Testing & Edge Cases | Low-light testing, glasses occlusion, head-pose evaluation, benchmark latency. |
| **Phase 10** | Viva & Final Integration | Final report compilation, presentation slide deck, production packaging. |
