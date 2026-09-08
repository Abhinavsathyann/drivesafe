/**
 * DriveSafe AI — Real-Time Camera Pipeline & Frame Capture Module (Vanilla JS)
 * Phase 2 Camera Engine for Academic Demonstrations & Flask Integration
 *
 * Privacy & Security:
 * - Operates entirely client-side.
 * - Video frames are NEVER uploaded, stored, or transmitted.
 * - Requests video stream ONLY with audio: false (no microphone).
 */

const DriveSafeCamera = {
  stream: null,
  videoElement: null,
  canvas: null,
  ctx: null,
  animFrameId: null,

  active: false,
  targetFPS: 10,
  frameIntervalMs: 100,
  lastFrameTime: 0,
  framesCaptured: 0,
  fpsWindowStart: 0,
  fpsFrameCount: 0,
  measuredFPS: 0,

  onFrameCallback: null,
  onDiagnosticsCallback: null,

  init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('[DriveSafeCamera] Page hidden, frame extraction suspended');
      } else {
        console.log('[DriveSafeCamera] Page visible, frame extraction active');
      }
    });
  },

  isSupported() {
    return typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  async enumerateDevices() {
    if (!this.isSupported() || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1}`,
        }));
    } catch (e) {
      console.warn('Could not enumerate cameras:', e);
      return [];
    }
  },

  async startStream(videoEl, deviceId) {
    if (!this.isSupported()) {
      const err = new Error('Browser does not support webcam access.');
      err.name = 'UnsupportedError';
      throw err;
    }

    this.stopStream();
    this.videoElement = videoEl;

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
      audio: false,
    };

    if (deviceId && deviceId !== 'default') {
      constraints.video.deviceId = { exact: deviceId };
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (err.name === 'OverconstrainedError') {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } else {
        throw err;
      }
    }

    this.stream = stream;

    if (this.videoElement) {
      this.videoElement.srcObject = stream;
      await this.videoElement.play();
    }

    // Monitor track ending
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.onended = () => {
        console.warn('Camera stream ended unexpectedly');
        if (window.onCameraTrackEnded) {
          window.onCameraTrackEnded();
        }
      };
    }

    return stream;
  },

  stopStream() {
    this.stopFramePipeline();

    if (this.stream) {
      try {
        const tracks = this.stream.getTracks();
        tracks.forEach((t) => t.stop());
      } catch (e) {
        console.warn('Error stopping tracks', e);
      }
      this.stream = null;
    }

    if (this.videoElement) {
      try {
        this.videoElement.pause();
        this.videoElement.srcObject = null;
      } catch (e) {}
    }
  },

  startFramePipeline(targetFPS = 10, onFrame, onDiagnostics) {
    this.stopFramePipeline();

    this.targetFPS = Math.max(1, Math.min(30, targetFPS));
    this.frameIntervalMs = 1000 / this.targetFPS;
    this.onFrameCallback = onFrame;
    this.onDiagnosticsCallback = onDiagnostics;

    this.active = true;
    this.lastFrameTime = performance.now();
    this.fpsWindowStart = performance.now();
    this.fpsFrameCount = 0;

    this.loop();
  },

  stopFramePipeline() {
    this.active = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.measuredFPS = 0;
  },

  captureCurrentFrame() {
    if (!this.videoElement || !this.canvas || !this.ctx) return null;
    if (this.videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const width = this.videoElement.videoWidth;
    const height = this.videoElement.videoHeight;
    if (width === 0 || height === 0) return null;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    try {
      this.ctx.drawImage(this.videoElement, 0, 0, width, height);
      const imageData = this.ctx.getImageData(0, 0, width, height);
      return {
        imageData,
        width,
        height,
        timestamp: performance.now(),
      };
    } catch (e) {
      console.warn('Error in captureCurrentFrame', e);
      return null;
    }
  },

  loop() {
    if (!this.active) return;

    this.animFrameId = requestAnimationFrame((now) => {
      if (!this.active) return;

      if (document.visibilityState === 'hidden') {
        this.loop();
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

          const windowElapsed = now - this.fpsWindowStart;
          if (windowElapsed >= 1000) {
            this.measuredFPS = Math.round((this.fpsFrameCount * 1000) / windowElapsed);
            this.fpsFrameCount = 0;
            this.fpsWindowStart = now;

            if (this.onDiagnosticsCallback) {
              this.onDiagnosticsCallback({
                measuredFPS: this.measuredFPS,
                framesCaptured: this.framesCaptured,
                width: frame.width,
                height: frame.height,
              });
            }
          }
        }
      }

      this.loop();
    });
  },

  parseError(err) {
    const name = err?.name || '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return {
        code: 'CAMERA_PERMISSION_DENIED',
        message: 'Camera permission denied. Please allow camera access in browser settings.',
      };
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return {
        code: 'CAMERA_UNAVAILABLE',
        message: 'No compatible camera found on this device.',
      };
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return {
        code: 'CAMERA_BUSY',
        message: 'Unable to start camera. It may be in use by another program.',
      };
    }
    if (name === 'SecurityError') {
      return {
        code: 'SECURITY_ERROR',
        message: 'Webcam access requires HTTPS or localhost.',
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: err?.message || 'Failed to start camera.',
    };
  },
};

// Initialize canvas immediately
DriveSafeCamera.init();
