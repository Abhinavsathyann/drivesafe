/**
 * DriveSafe AI — Real-Time Camera Pipeline & Frame Capture Service
 * Phase 2 Foundation
 *
 * Privacy & Security:
 * - Operates entirely client-side.
 * - Video frames are NEVER uploaded, stored, or transmitted.
 * - Requests video stream ONLY with audio: false (no microphone).
 */

import { CameraDeviceInfo, CapturedFrameContract } from '../types/drivesafe';

export interface CameraErrorResult {
  code:
    | 'CAMERA_PERMISSION_DENIED'
    | 'CAMERA_UNAVAILABLE'
    | 'CAMERA_BUSY'
    | 'BROWSER_CAMERA_UNSUPPORTED'
    | 'SECURITY_ERROR'
    | 'UNKNOWN_ERROR';
  message: string;
}

/**
 * Checks whether navigator.mediaDevices.getUserMedia is supported.
 */
export function isCameraSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

/**
 * Enumerate available video input devices.
 * Note: Labels may be blank until the user grants camera permissions.
 */
export async function enumerateCameras(): Promise<CameraDeviceInfo[]> {
  if (!isCameraSupported() || !navigator.mediaDevices.enumerateDevices) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');

    return videoDevices.map((d, index) => ({
      deviceId: d.deviceId,
      label: d.label || `Camera ${index + 1}${d.deviceId ? ` (${d.deviceId.slice(0, 5)}...)` : ''}`,
    }));
  } catch (err) {
    console.warn('[DriveSafe Camera] Could not enumerate video devices:', err);
    return [];
  }
}

/**
 * Requests camera access using standard navigator.mediaDevices.getUserMedia.
 * Configured with audio: false (never requests microphone).
 */
export async function requestCameraStream(deviceId?: string): Promise<MediaStream> {
  if (!isCameraSupported()) {
    const err = new Error('Browser does not support webcam access.') as any;
    err.name = 'UnsupportedError';
    throw err;
  }

  const baseVideoConstraints: MediaTrackConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',
  };

  if (deviceId && deviceId !== 'default' && deviceId !== '') {
    baseVideoConstraints.deviceId = { exact: deviceId };
  }

  try {
    return await navigator.mediaDevices.getUserMedia({
      video: baseVideoConstraints,
      audio: false,
    });
  } catch (initialErr: any) {
    // If overconstrained (e.g. ideal resolution or exact deviceId not supported), fallback to simple video: true
    if (initialErr.name === 'OverconstrainedError') {
      console.warn('[DriveSafe Camera] OverconstrainedError, falling back to default video constraints');
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }
    throw initialErr;
  }
}

/**
 * Safely stops all tracks on a MediaStream and releases hardware resources.
 */
export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;

  try {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('[DriveSafe Camera] Error stopping track:', err);
      }
    });
  } catch (err) {
    console.warn('[DriveSafe Camera] Error releasing media stream:', err);
  }
}

/**
 * Translates browser DOMException into a friendly, structured diagnostic message.
 */
export function parseCameraError(err: any): CameraErrorResult {
  const errorName = err?.name || '';

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return {
      code: 'CAMERA_PERMISSION_DENIED',
      message: 'Camera permission was denied. Please allow camera access in your browser settings and try again.',
    };
  }

  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      code: 'CAMERA_UNAVAILABLE',
      message: 'No compatible camera was found on this device.',
    };
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      code: 'CAMERA_BUSY',
      message: 'Unable to start camera. The webcam may already be in use by another program (Zoom, Teams, etc.).',
    };
  }

  if (errorName === 'SecurityError') {
    return {
      code: 'SECURITY_ERROR',
      message: 'Webcam access requires a secure context (HTTPS or localhost).',
    };
  }

  if (errorName === 'UnsupportedError') {
    return {
      code: 'BROWSER_CAMERA_UNSUPPORTED',
      message: 'Your current browser does not support the modern navigator.mediaDevices API.',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: err?.message || 'An unexpected error occurred while accessing the camera.',
  };
}

/**
 * Frame Pipeline Controller
 * Manages off-screen canvas extraction at a controlled target FPS.
 * Decouples camera display rate from computer-vision processing rate.
 */
export class FramePipelineManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private animFrameId: number | null = null;

  private active = false;
  private targetFPS = 10;
  private frameIntervalMs = 100;
  private lastFrameTime = 0;

  private framesCaptured = 0;
  private fpsWindowStart = 0;
  private fpsFrameCount = 0;
  private currentMeasuredFPS = 0;

  private onFrameCallback?: (frame: CapturedFrameContract) => void;
  private onDiagnosticsCallback?: (stats: {
    measuredFPS: number;
    framesCaptured: number;
    width: number;
    height: number;
  }) => void;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
  }

  /**
   * Initializes or updates the frame extraction loop.
   */
  public start(
    videoEl: HTMLVideoElement,
    targetFPS = 10,
    onFrame?: (frame: CapturedFrameContract) => void,
    onDiagnostics?: (stats: {
      measuredFPS: number;
      framesCaptured: number;
      width: number;
      height: number;
    }) => void
  ): void {
    this.stop();

    this.videoEl = videoEl;
    this.targetFPS = Math.max(1, Math.min(30, targetFPS));
    this.frameIntervalMs = 1000 / this.targetFPS;
    this.onFrameCallback = onFrame;
    this.onDiagnosticsCallback = onDiagnostics;

    this.active = true;
    this.lastFrameTime = performance.now();
    this.fpsWindowStart = performance.now();
    this.fpsFrameCount = 0;

    this.scheduleNextFrame();
  }

  /**
   * Stops frame capture and clears scheduling.
   */
  public stop(): void {
    this.active = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.currentMeasuredFPS = 0;
  }

  /**
   * Captures a single instantaneous frame synchronously on demand.
   * Useful for Phase 3/6 discrete frame requests.
   */
  public captureCurrentFrame(): CapturedFrameContract | null {
    if (!this.videoEl || !this.canvas || !this.ctx) return null;
    if (this.videoEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const width = this.videoEl.videoWidth;
    const height = this.videoEl.videoHeight;
    if (width === 0 || height === 0) return null;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    try {
      // Draw pristine video frame onto neutral unmirrored canvas
      this.ctx.drawImage(this.videoEl, 0, 0, width, height);
      const imageData = this.ctx.getImageData(0, 0, width, height);

      return {
        imageData,
        width,
        height,
        timestamp: performance.now(),
      };
    } catch (err) {
      console.warn('[DriveSafe FramePipeline] Frame capture error:', err);
      return null;
    }
  }

  private scheduleNextFrame(): void {
    if (!this.active) return;

    this.animFrameId = requestAnimationFrame((now) => {
      if (!this.active) return;

      // Honor document visibility — pause capture loop if tab is hidden
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        this.scheduleNextFrame();
        return;
      }

      const elapsed = now - this.lastFrameTime;

      if (elapsed >= this.frameIntervalMs) {
        this.lastFrameTime = now - (elapsed % this.frameIntervalMs);

        const frame = this.captureCurrentFrame();
        if (frame) {
          this.framesCaptured++;
          this.fpsFrameCount++;

          if (this.onFrameCallback) {
            this.onFrameCallback(frame);
          }

          // Measure actual FPS over a 1000ms sliding window
          const windowElapsed = now - this.fpsWindowStart;
          if (windowElapsed >= 1000) {
            this.currentMeasuredFPS = Math.round((this.fpsFrameCount * 1000) / windowElapsed);
            this.fpsFrameCount = 0;
            this.fpsWindowStart = now;

            if (this.onDiagnosticsCallback) {
              this.onDiagnosticsCallback({
                measuredFPS: this.currentMeasuredFPS,
                framesCaptured: this.framesCaptured,
                width: frame.width,
                height: frame.height,
              });
            }
          }
        }
      }

      this.scheduleNextFrame();
    });
  }

  public getStats() {
    return {
      active: this.active,
      targetFPS: this.targetFPS,
      measuredFPS: this.currentMeasuredFPS,
      framesCaptured: this.framesCaptured,
    };
  }
}
