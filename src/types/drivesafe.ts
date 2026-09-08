/**
 * DriveSafe AI — Core Type Definitions and Integration Contracts
 * BCA College Project — Phase 1 & Phase 2 Foundation
 */

export type NavigationTab = 'dashboard' | 'monitor' | 'sessions' | 'settings' | 'about';

export type EyeState = 'OPEN' | 'CLOSED' | 'UNKNOWN';

export type DrowsinessRisk =
  | 'ATTENTIVE'
  | 'MONITORING'
  | 'POSSIBLE_DROWSINESS'
  | 'DROWSINESS_ALERT'
  | 'WAITING_FOR_ANALYSIS'
  | 'UNKNOWN'
  | 'NOT_MONITORING';

export type CameraStatus =
  | 'NOT_CONNECTED'
  | 'REQUESTING_ACCESS'
  | 'INITIALIZING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'ERROR';

export type CameraPermissionState =
  | 'UNKNOWN'
  | 'REQUESTING'
  | 'GRANTED'
  | 'DENIED'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'STOPPED';

export type FaceStatus =
  | 'WAITING'
  | 'WAITING_FOR_DETECTION'
  | 'DETECTED'
  | 'NOT_DETECTED'
  | 'MULTIPLE_FACES'
  | 'POOR_LIGHTING';

export type EyeStatus =
  | 'WAITING'
  | 'WAITING_FOR_DETECTION'
  | 'DETECTED'
  | 'NOT_DETECTED'
  | 'OCCLUDED';

export type SystemErrorCode =
  | 'CAMERA_PERMISSION_DENIED'
  | 'CAMERA_UNAVAILABLE'
  | 'CAMERA_BUSY'
  | 'NO_FACE_DETECTED'
  | 'MULTIPLE_FACES_DETECTED'
  | 'EYES_NOT_VISIBLE'
  | 'POOR_LIGHTING'
  | 'MODEL_UNAVAILABLE'
  | 'BACKEND_UNAVAILABLE'
  | 'BROWSER_CAMERA_UNSUPPORTED';

/**
 * Camera Device Description
 */
export interface CameraDeviceInfo {
  deviceId: string;
  label: string;
}

/**
 * Phase 2 Captured Frame Contract for Future CV/ML Pipeline (Phase 3 & 6)
 */
export interface CapturedFrameContract {
  imageData: ImageData | null;
  width: number;
  height: number;
  timestamp: number; // Browser performance.now() or Epoch
}

/**
 * Centralized Application State Interface
 */
export interface AppState {
  cameraConnected: boolean;
  monitoring: boolean;
  faceDetected: boolean;
  leftEyeState: EyeState;
  rightEyeState: EyeState;
  eyeClosureDuration: number; // in seconds, e.g. 0.0
  mlConfidence: number | null; // null in Phase 1 & 2
  drowsinessRisk: DrowsinessRisk;
  alertActive: boolean;
  thresholdSeconds: number; // default 5.0 seconds
  sessionStartTime: number | null;
  cameraStatus: CameraStatus;
  cameraPermission: CameraPermissionState;
  cameraError: string | null;
  faceStatus: FaceStatus;
  eyeStatus: EyeStatus;
  activeError: SystemErrorCode | null;

  // Phase 2 Diagnostics & Camera Pipeline State
  videoReady: boolean;
  videoWidth: number;
  videoHeight: number;
  streamActive: boolean;
  targetFPS: number; // Configurable processing rate, e.g. 10 FPS
  measuredFPS: number;
  framesCaptured: number;
  lastFrameTimestamp: number | null;
  availableCameras: CameraDeviceInfo[];
}

/**
 * User Configurable Settings
 */
export interface SettingsState {
  thresholdSeconds: number; // Functional (1.0 to 10.0s)
  alertSound: boolean; // Functional
  alertVolume: number; // Functional (0 to 100%)
  cameraDevice: string; // Functional in Phase 2
  mirrorCamera: boolean; // Functional in Phase 2 (default: true)
  confidenceThreshold: number; // Future ML Setting (Phase 5/6)
  targetFPS: number; // Phase 2 processing FPS (default: 10)
}

/**
 * Session Statistics for History (Phase 1 Baseline)
 */
export interface SessionStats {
  monitoringDuration: string; // "00:00"
  drowsinessEvents: number; // 0
  longestEyeClosure: string; // "—"
  averageConfidence: string; // "—"
}

/**
 * FUTURE ML INTEGRATION CONTRACT (Phases 5 & 6)
 * Real ML models will emit this data payload
 */
export interface MlPredictionContract {
  left_eye: 'OPEN' | 'CLOSED';
  right_eye: 'OPEN' | 'CLOSED';
  confidence: number; // 0.0 to 1.0
  timestamp: number;
}

/**
 * FUTURE COMPUTER VISION CONTRACT (Phases 3)
 * Computer vision pipeline will emit this data structure
 */
export interface CvPipelineResultContract {
  faceDetected: boolean;
  faceBoundingBox?: { x: number; y: number; width: number; height: number };
  leftEyeLandmarks?: Array<{ x: number; y: number }>;
  rightEyeLandmarks?: Array<{ x: number; y: number }>;
  leftEyeState: EyeState;
  rightEyeState: EyeState;
  confidence: number | null;
  lightingQuality?: 'adequate' | 'poor';
}
