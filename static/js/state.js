/**
 * DriveSafe AI — State Architecture Module (Vanilla JS)
 * Phase 1 & Phase 2 Foundation: Centralized state representation & transitions
 */

const DriveSafeState = {
  // Central Application State
  state: {
    cameraConnected: false,
    monitoring: false,
    faceDetected: false,
    leftEyeState: 'UNKNOWN',
    rightEyeState: 'UNKNOWN',
    eyeClosureDuration: 0.0,
    mlConfidence: null,
    drowsinessRisk: 'NOT_MONITORING',
    alertActive: false,
    thresholdSeconds: 5.0,
    sessionStartTime: null,
    cameraStatus: 'NOT_CONNECTED',
    cameraPermission: 'UNKNOWN',
    cameraError: null,
    faceStatus: 'WAITING',
    eyeStatus: 'WAITING',
    activeError: null,

    // Phase 2 Diagnostics & Pipeline State
    videoReady: false,
    videoWidth: 0,
    videoHeight: 0,
    streamActive: false,
    targetFPS: 10,
    measuredFPS: 0,
    framesCaptured: 0,
    lastFrameTimestamp: null,
    availableCameras: [],
  },

  // Settings
  settings: {
    thresholdSeconds: 5.0,
    alertSound: true,
    alertVolume: 80,
    cameraDevice: 'default',
    mirrorCamera: true,
    confidenceThreshold: 0.80,
    targetFPS: 10,
  },

  // Session Statistics
  sessionStats: {
    monitoringDuration: '00:00',
    drowsinessEvents: 0,
    longestEyeClosure: '—',
    averageConfidence: '—',
  },

  init() {
    this.loadSettings();
  },

  loadSettings() {
    try {
      const saved = localStorage.getItem('drivesafe_ai_settings');
      if (saved) {
        Object.assign(this.settings, JSON.parse(saved));
        this.state.thresholdSeconds = this.settings.thresholdSeconds;
        this.state.targetFPS = this.settings.targetFPS || 10;
      }
    } catch (e) {
      console.warn('Could not load settings from localStorage', e);
    }
  },

  saveSettings(newSettings) {
    Object.assign(this.settings, newSettings);
    if (newSettings.thresholdSeconds !== undefined) {
      this.state.thresholdSeconds = parseFloat(newSettings.thresholdSeconds);
    }
    if (newSettings.targetFPS !== undefined) {
      this.state.targetFPS = parseInt(newSettings.targetFPS, 10);
    }
    try {
      localStorage.setItem('drivesafe_ai_settings', JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save settings to localStorage', e);
    }
  },

  startMonitoring() {
    this.state.monitoring = true;
    this.state.cameraStatus = 'REQUESTING_ACCESS';
    this.state.cameraPermission = 'REQUESTING';
    this.state.cameraError = null;
    this.state.drowsinessRisk = 'WAITING_FOR_ANALYSIS';
    this.state.faceStatus = 'WAITING_FOR_DETECTION';
    this.state.eyeStatus = 'WAITING_FOR_DETECTION';
    this.state.sessionStartTime = Date.now();
  },

  onCameraStarted(width, height) {
    this.state.cameraConnected = true;
    this.state.cameraStatus = 'CONNECTED';
    this.state.cameraPermission = 'GRANTED';
    this.state.streamActive = true;
    this.state.videoReady = true;
    this.state.videoWidth = width;
    this.state.videoHeight = height;
    this.state.faceStatus = 'WAITING_FOR_DETECTION';
    this.state.eyeStatus = 'WAITING_FOR_DETECTION';
    this.state.drowsinessRisk = 'WAITING_FOR_ANALYSIS';
  },

  onCameraError(err) {
    const parsed = DriveSafeCamera.parseError(err);
    this.state.monitoring = false;
    this.state.cameraConnected = false;
    this.state.cameraStatus = 'ERROR';
    this.state.cameraPermission = parsed.code === 'CAMERA_PERMISSION_DENIED' ? 'DENIED' : 'ERROR';
    this.state.cameraError = parsed.message;
    this.state.activeError = parsed.code;
    this.state.streamActive = false;
    this.state.videoReady = false;
    this.state.drowsinessRisk = 'NOT_MONITORING';
    this.state.faceStatus = 'WAITING';
    this.state.eyeStatus = 'WAITING';
  },

  stopMonitoring() {
    this.state.monitoring = false;
    this.state.cameraConnected = false;
    this.state.cameraStatus = 'DISCONNECTED';
    this.state.cameraPermission = this.state.cameraPermission === 'DENIED' ? 'DENIED' : 'STOPPED';
    this.state.streamActive = false;
    this.state.videoReady = false;
    this.state.faceStatus = 'WAITING';
    this.state.eyeStatus = 'WAITING';
    this.state.faceDetected = false;
    this.state.leftEyeState = 'UNKNOWN';
    this.state.rightEyeState = 'UNKNOWN';
    this.state.eyeClosureDuration = 0.0;
    this.state.drowsinessRisk = 'NOT_MONITORING';
    this.state.alertActive = false;
    this.state.sessionStartTime = null;
    this.state.measuredFPS = 0;
    this.state.framesCaptured = 0;
  },

  resetMonitoringState() {
    this.stopMonitoring();
  },

  updateCameraStatus(status, connected = false) {
    this.state.cameraStatus = status;
    this.state.cameraConnected = connected;
  },

  updateFaceStatus(status, detected = false) {
    this.state.faceStatus = status;
    this.state.faceDetected = detected;
  },

  updateEyeStatus(status, left = 'UNKNOWN', right = 'UNKNOWN') {
    this.state.eyeStatus = status;
    this.state.leftEyeState = left;
    this.state.rightEyeState = right;
  },

  updateDrowsinessStatus(risk) {
    this.state.drowsinessRisk = risk;
  },

  updateClosureTimer(seconds) {
    this.state.eyeClosureDuration = Math.max(0, seconds);
  },

  showAlert() {
    this.state.alertActive = true;
    this.state.drowsinessRisk = 'DROWSINESS_ALERT';
  },

  dismissAlert() {
    this.state.alertActive = false;
    this.state.drowsinessRisk = this.state.monitoring ? 'WAITING_FOR_ANALYSIS' : 'NOT_MONITORING';
    this.state.eyeClosureDuration = 0.0;
  },

  setAvailableCameras(cameras) {
    this.state.availableCameras = cameras;
  },

  setDiagnostics(diag) {
    this.state.measuredFPS = diag.measuredFPS;
    this.state.framesCaptured = diag.framesCaptured;
    if (diag.width) this.state.videoWidth = diag.width;
    if (diag.height) this.state.videoHeight = diag.height;
  },
};
