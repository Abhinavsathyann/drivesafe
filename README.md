# DriveSafe AI — Phase 1: Project Architecture & Professional Web Foundation

**BCA College Final-Year Project Prototype**  
**Real-Time Driver Drowsiness Detection Using Computer Vision and Machine Learning**

---

## Academic Prototype Disclaimer

> **IMPORTANT**: This application is an academic/educational prototype and **NOT a certified automotive safety system**. It does not guarantee accident prevention, determine sleep with medical certainty, or replace professional driver-monitoring hardware. All video data is processed locally on the client machine to safeguard privacy.

---

## 1. Project Overview & Phase 1 Objective

DriveSafe AI investigates real-time driver drowsiness monitoring through webcam-based facial and eye-state analysis. The project is being developed across **10 strictly controlled phases**.

**Phase 1 establishes**:
* Complete application architecture, project directory layout, and separation of concerns.
* Production-grade automotive-AI dashboard UI/UX design system with design tokens and high-contrast status colors (Green, Yellow, Orange, Red).
* Reusable status components, active error-state architecture for 9 failure modes, and alert modal overlay.
* Live camera placeholder with cockpit reticle and right-side eye analysis panel (OPEN/CLOSED/UNKNOWN).
* Centralized frontend state architecture with clean functional transitions.
* Architectural contracts and interface specifications for future Computer Vision (OpenCV/MediaPipe) and Machine Learning (TensorFlow/Keras) subsystems.
* Dual-stack support: Fully functional React/TypeScript live application for the AI Studio preview alongside an executable Python Flask backend with vanilla HTML5/CSS3/JavaScript for college submission.

---

## 2. Project Directory Structure

```
drivesafe-ai/
│
├── app.py                      # Flask backend entry point & REST API endpoints
├── requirements.txt            # Python dependencies (Flask, OpenCV, TensorFlow, etc.)
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
│   │   └── responsive.css      # Responsive media queries (Desktop/Laptop/Tablet/Mobile)
│   ├── js/
│   │   ├── state.js            # Centralized JavaScript state management
│   │   ├── ui.js               # UI rendering & DOM updates
│   │   └── app.js              # Application bootstrapper & event listeners
│   └── assets/                 # Static icons and assets
│
├── src/                        # Interactive React + Tailwind preview application
│   ├── types/
│   │   └── drivesafe.ts        # TypeScript interfaces, enums & integration contracts
│   ├── context/
│   │   └── DriveSafeContext.tsx# Centralized state provider & state machine
│   ├── components/
│   │   ├── Navigation.tsx      # Sticky header, brand badge & tab routing
│   │   ├── StatusBadge.tsx     # Reusable 4-state indicator (Green, Yellow, Orange, Red)
│   │   ├── DashboardView.tsx   # Dashboard with 4 subsystem cards & 8-stage pipeline
│   │   ├── MonitorView.tsx     # Central camera preview, eye panel & 5s timer
│   │   ├── DrowsinessAlertModal.tsx # Safety warning modal with dismiss/stop controls
│   │   ├── SessionsView.tsx    # Session metrics & planned chart wireframes
│   │   ├── SettingsView.tsx    # Threshold slider, audio controls & future ML flags
│   │   ├── AboutView.tsx       # Viva guide, project abstract & technology matrix
│   │   └── ErrorStatesPanel.tsx# Diagnostic previewer for 9 system edge cases
│   ├── App.tsx                 # Root React component
│   └── main.tsx                # React entry point
│
├── vision/
│   ├── face_detection.py       # FaceDetectorInterface (Reserved for Phase 3)
│   ├── eye_detection.py        # EyeDetectorInterface (Reserved for Phase 3)
│   └── preprocessing.py        # EyePreprocessorInterface (Reserved for Phase 4)
│
├── ml/
│   ├── dataset/README.md       # Dataset acquisition & splits (Phase 4)
│   ├── training/README.md      # Training scripts & notebooks (Phase 5)
│   ├── model/README.md         # Serialized CNN weights (.h5) (Phase 5/6)
│   └── inference/
│       └── predictor.py        # EyeStatePredictorInterface (Phase 6)
│
├── data/README.md              # Local telemetry data storage (Phase 8)
├── notebooks/README.md         # Jupyter notebooks for model EDA (Phase 5)
└── tests/
    └── test_architecture.py   # Architecture & contract unit test suite
```

---

## 3. Installation Instructions

### Method A: Running with Python & Flask (College Submission / Local Server)

1. **Prerequisites**: Python 3.10+ installed.
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```
3. **Install Phase 1 Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Method B: Running with Node.js & Vite (Interactive Web Preview)

1. **Prerequisites**: Node.js 18+ installed.
2. **Install Node dependencies**:
   ```bash
   npm install
   ```

---

## 4. Run Instructions

### Starting the Flask Application:
```bash
python app.py
```
Open your browser and navigate to: `http://localhost:5000`

### Starting the Node/Vite Dev Server:
```bash
npm run dev
```
Open your browser and navigate to: `http://localhost:3000`

### Running the Phase 1 Architectural Tests:
```bash
python -m unittest tests/test_architecture.py
```

---

## 5. Implemented Features (Phase 1 Only)

* **Design System**: High-contrast, automotive dark cockpit theme using CSS variables and Tailwind tokens.
* **Top Navigation**: Responsive navigation with tabs (`Dashboard`, `Monitor`, `Sessions`, `Settings`, `About`) and a dynamic `START MONITORING` CTA.
* **Main Dashboard**: System ready status, 4 primary summary status cards (`Camera Status: NOT CONNECTED`, `Face Detection: WAITING`, `Eye Analysis: WAITING`, `Drowsiness Status: NOT MONITORING`), 8-stage pipeline architecture diagram, and 10-phase project progress tracker.
* **Live Monitor Interface**: Central camera preview with alignment crosshair and corner brackets, overlay badges, right-side eye analysis panel (`LEFT EYE: UNKNOWN`, `RIGHT EYE: UNKNOWN`, `EYE CLOSURE: 0.0 sec`, `ML CONFIDENCE: —`, `DROWSINESS RISK: UNKNOWN`).
* **Drowsiness Timer UI**: `Eye Closure Duration: 00.0s`, `Alert Threshold: 05.0s`, `Progress: 0%`, accompanied by clear documentation of the 5-second temporal detection logic.
* **Status System**: 4 primary visual states (`GREEN: ALERT / ATTENTIVE`, `YELLOW: MONITORING`, `ORANGE: POSSIBLE DROWSINESS`, `RED: DROWSINESS ALERT`) plus system states (`UNKNOWN`, `NOT MONITORING`, `CAMERA ERROR`, `FACE NOT DETECTED`, `EYE NOT DETECTED`, `MODEL UNAVAILABLE`).
* **Alert UI Modal**: High-contrast warning modal with header, description, and action buttons (`[ DISMISS ]` and `[ STOP MONITORING ]`), testable via a dedicated test button without faking detections.
* **Session Statistics View**: Baseline session metrics (`00:00 duration`, `0 events`, `— peak closure`, `— average confidence`), realistic empty state, and 4 wireframe chart containers for future Phase 8 analytics.
* **Settings View**: Configurable alert threshold (1.0s – 10.0s, default 5.0s), audio toggle, volume slider (default 80%), camera device selector, mirror toggle, with persistent `localStorage` synchronization. Clearly tags future ML settings.
* **About & College Viva Section**: Abstract, disclaimer, problem statement, technology stack matrix, and 12 essential BCA viva topics.
* **Error State Architecture**: Interactive diagnostic panel showcasing all 9 failure modes with clear user-facing remedies.
* **Frontend State Architecture**: Centralized reactive state with required controller methods (`initializeApplication`, `startMonitoring`, `stopMonitoring`, `updateCameraStatus`, `updateFaceStatus`, `updateEyeStatus`, `updateDrowsinessStatus`, `updateClosureTimer`, `showAlert`, `dismissAlert`, `resetMonitoringState`, `saveSettings`, `loadSettings`).

---

## 6. Not-Yet-Implemented Features (Disciplined Phasing)

| Phase | Title | Scope & Status |
|---|---|---|
| **Phase 2** | Webcam Access Pipeline | `navigator.mediaDevices.getUserMedia` video stream integration, frame rendering. |
| **Phase 3** | Face & Eye Detection (CV) | OpenCV / MediaPipe facial landmark localization & eye ROI extraction. |
| **Phase 4** | Dataset Preparation | MRL Eye dataset ingestion, preprocessing, augmentation, and normalization. |
| **Phase 5** | ML Model Training | CNN training in TensorFlow/Keras for OPEN vs CLOSED binary classification. |
| **Phase 6** | Real-Time ML Inference | Connecting model weights to frame stream, producing real confidence scores. |
| **Phase 7** | Temporal Engine & Alerts | Continuous 5.0-second closure accumulator, audio buzzer synthesis, alert trigger. |
| **Phase 8** | Analytics & Session History | Telemetry recording, Recharts/D3 time-series graphs, vigilance scoring. |
| **Phase 9** | Testing & Edge Cases | Low-light testing, glasses occlusion, head-pose evaluation, benchmark latency. |
| **Phase 10** | Viva & Final Integration | Final report compilation, presentation slide deck, production packaging. |

---

## 7. Integration Map: Connecting Phase 2 to Phase 1

In **Phase 2**, the webcam video stream will directly connect to the Phase 1 architecture through the following exact points:

1. **HTML `<video>` Element Injection**:
   In `MonitorView.tsx` (or `templates/index.html`), the central `#camera-container` will host an HTML5 `<video id="webcam-stream" autoplay playsinline muted>` element.
2. **Camera Status State Transition**:
   On permission grant, call:
   ```typescript
   updateCameraStatus('CONNECTED', true);
   ```
   On permission denial or hardware error, call:
   ```typescript
   updateCameraStatus('ERROR', false);
   setActiveError('CAMERA_PERMISSION_DENIED');
   ```
3. **Mirror Camera Preference**:
   The video element will read the Phase 1 setting `settings.mirrorCamera` to conditionally apply CSS `transform: scaleX(-1)`.
4. **Frame Extraction for Phase 3**:
   A hidden HTML5 `<canvas id="frame-buffer">` will capture frames at 30 FPS (`requestAnimationFrame` loop) to pass raw image arrays into the Phase 3 Computer Vision pipeline.
