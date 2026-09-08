/**
 * DriveSafe AI — UI Rendering & DOM Updates (Vanilla JS)
 * Phase 1 & Phase 2 Foundation
 */

const DriveSafeUI = {
  elements: {},

  init() {
    this.cacheDom();
    this.render();
  },

  cacheDom() {
    this.elements = {
      navDashboard: document.getElementById('nav-dashboard'),
      navMonitor: document.getElementById('nav-monitor'),
      navSessions: document.getElementById('nav-sessions'),
      navSettings: document.getElementById('nav-settings'),
      navAbout: document.getElementById('nav-about'),
      mainCtaBtn: document.getElementById('main-nav-cta'),
      dashboardCtaBtn: document.getElementById('dashboard-start-monitoring-btn'),
      alertOverlay: document.getElementById('drowsiness-alert-overlay'),
      alertDismissBtn: document.getElementById('btn-alert-dismiss'),
      alertStopBtn: document.getElementById('btn-alert-stop'),
      tabs: document.querySelectorAll('.tab-view'),
      navBtns: document.querySelectorAll('.nav-btn'),

      // Status badges
      cameraBadge: document.getElementById('badge-camera-status'),
      faceBadge: document.getElementById('badge-face-status'),
      eyeBadge: document.getElementById('badge-eye-status'),
      drowsinessBadge: document.getElementById('badge-drowsiness-status'),

      // Video & Camera elements
      cameraVideo: document.getElementById('camera-video'),
      cameraPlaceholder: document.getElementById('camera-placeholder'),
      cameraPlaceholderTitle: document.getElementById('camera-placeholder-title'),
      cameraPlaceholderSubtitle: document.getElementById('camera-placeholder-subtitle'),
      cameraLiveBadge: document.getElementById('camera-live-badge'),
      cameraDimensionsDisplay: document.getElementById('camera-dimensions-display'),
      cameraDeviceSelect: document.getElementById('camera-device-select'),
      mirrorToggle: document.getElementById('mirror-preview-toggle'),

      // Diagnostics elements
      diagCamStatus: document.getElementById('diag-cam-status'),
      diagResolution: document.getElementById('diag-resolution'),
      diagVideoReady: document.getElementById('diag-video-ready'),
      diagFps: document.getElementById('diag-fps'),
      diagFrames: document.getElementById('diag-frames'),
      
      // Phase 3 Diagnostics
      diagFaceCount: document.getElementById('diag-face-count'),
      diagFaceQuality: document.getElementById('diag-face-quality'),
      diagCrops: document.getElementById('diag-crops'),
      diagCvTime: document.getElementById('diag-cv-time'),

      // Monitor elements
      monitorLeftEye: document.getElementById('monitor-left-eye'),
      monitorRightEye: document.getElementById('monitor-right-eye'),
      monitorClosureDuration: document.getElementById('monitor-closure-duration'),
      monitorConfidence: document.getElementById('monitor-confidence'),
      monitorDrowsinessRisk: document.getElementById('monitor-drowsiness-risk'),
      timerDuration: document.getElementById('timer-duration-display'),
      timerThreshold: document.getElementById('timer-threshold-display'),
      timerProgress: document.getElementById('timer-progress-bar'),
      timerProgressText: document.getElementById('timer-progress-text'),
    };
  },

  render() {
    this.updateDashboard();
    this.updateCameraUI();
    this.updateMonitor();
    this.updateBadges();
    this.updateAlert();
  },

  showTab(tabId) {
    if (!this.elements.tabs) return;
    this.elements.tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.id === `tab-${tabId}`);
    });
    this.elements.navBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.id === `nav-${tabId}`);
    });
  },

  updateDashboard() {
    const s = DriveSafeState.state;
    const ctaText = s.cameraStatus === 'REQUESTING_ACCESS'
      ? 'REQUESTING ACCESS...'
      : s.monitoring
      ? 'STOP MONITORING'
      : 'START MONITORING';
    const ctaClass = s.monitoring ? 'btn-danger' : 'btn-primary';

    if (this.elements.mainCtaBtn) {
      this.elements.mainCtaBtn.textContent = ctaText;
      this.elements.mainCtaBtn.className = ctaClass;
      this.elements.mainCtaBtn.disabled = s.cameraStatus === 'REQUESTING_ACCESS';
    }

    if (this.elements.dashboardCtaBtn) {
      this.elements.dashboardCtaBtn.textContent = ctaText;
      this.elements.dashboardCtaBtn.className = ctaClass;
      this.elements.dashboardCtaBtn.disabled = s.cameraStatus === 'REQUESTING_ACCESS';
    }
  },

  updateCameraUI() {
    const s = DriveSafeState.state;
    const set = DriveSafeState.settings;

    if (this.elements.cameraVideo) {
      this.elements.cameraVideo.classList.toggle('active', s.streamActive);
      this.elements.cameraVideo.classList.toggle('mirrored', !!set.mirrorCamera);
    }

    if (this.elements.cameraPlaceholder) {
      this.elements.cameraPlaceholder.style.display = s.streamActive ? 'none' : 'block';
    }

    if (this.elements.cameraLiveBadge) {
      this.elements.cameraLiveBadge.classList.toggle('active', s.streamActive);
    }

    if (this.elements.cameraPlaceholderTitle) {
      if (s.cameraStatus === 'REQUESTING_ACCESS') {
        this.elements.cameraPlaceholderTitle.textContent = 'CAMERA ACCESS REQUIRED';
        if (this.elements.cameraPlaceholderSubtitle) {
          this.elements.cameraPlaceholderSubtitle.textContent =
            'Please click "Allow" when prompted by your browser to enable real-time monitoring.';
        }
      } else if (s.cameraStatus === 'ERROR') {
        this.elements.cameraPlaceholderTitle.textContent = 'CAMERA UNAVAILABLE';
        if (this.elements.cameraPlaceholderSubtitle) {
          this.elements.cameraPlaceholderSubtitle.textContent =
            s.cameraError || 'Could not connect to webcam.';
        }
      } else {
        this.elements.cameraPlaceholderTitle.textContent = 'CAMERA PREVIEW';
        if (this.elements.cameraPlaceholderSubtitle) {
          this.elements.cameraPlaceholderSubtitle.textContent = 'CAMERA NOT STARTED';
        }
      }
    }

    if (this.elements.cameraDimensionsDisplay) {
      this.elements.cameraDimensionsDisplay.textContent = s.videoReady
        ? `${s.videoWidth} × ${s.videoHeight}`
        : 'OFFLINE';
    }

    // Diagnostics
    if (this.elements.diagCamStatus) {
      this.elements.diagCamStatus.textContent = s.cameraStatus;
    }
    if (this.elements.diagResolution) {
      this.elements.diagResolution.textContent = s.videoReady ? `${s.videoWidth} × ${s.videoHeight}` : '—';
    }
    if (this.elements.diagVideoReady) {
      this.elements.diagVideoReady.textContent = s.videoReady ? 'YES' : 'NO';
    }
    if (this.elements.diagFps) {
      this.elements.diagFps.textContent = `${s.measuredFPS} FPS (${s.targetFPS || 10} Target)`;
    }
    if (this.elements.diagFrames) {
      this.elements.diagFrames.textContent = s.framesCaptured;
    }

    // Phase 3 Diagnostics
    if (this.elements.diagFaceCount) {
      this.elements.diagFaceCount.textContent = s.faceCount;
    }
    if (this.elements.diagFaceQuality) {
      this.elements.diagFaceQuality.textContent = s.faceQuality;
    }
    if (this.elements.diagCrops) {
      const l = s.leftEyeCropValid ? 'YES' : 'NO';
      const r = s.rightEyeCropValid ? 'YES' : 'NO';
      this.elements.diagCrops.textContent = `L: ${l} | R: ${r}`;
    }
    if (this.elements.diagCvTime) {
      this.elements.diagCvTime.textContent = `${s.processTimeMs}ms | EAR: L:${s.leftEAR} R:${s.rightEAR}`;
    }
  },

  updateBadges() {
    const s = DriveSafeState.state;
    if (this.elements.cameraBadge) {
      this.elements.cameraBadge.textContent = s.cameraStatus.replace(/_/g, ' ');
      this.elements.cameraBadge.className = 'status-badge ' + (
        s.cameraStatus === 'CONNECTED' ? 'status-attentive' :
        s.cameraStatus === 'ERROR' ? 'status-alert' :
        s.cameraStatus === 'REQUESTING_ACCESS' ? 'status-monitoring' : ''
      );
    }
    if (this.elements.faceBadge) {
      this.elements.faceBadge.textContent = s.faceStatus.replace(/_/g, ' ');
      this.elements.faceBadge.className = 'status-badge ' + (
        s.faceStatus === 'DETECTED' ? 'status-attentive' :
        s.faceStatus === 'MULTIPLE_FACES' ? 'status-alert' :
        s.faceStatus === 'NOT_DETECTED' ? 'status-monitoring' : ''
      );
    }
    if (this.elements.eyeBadge) {
      this.elements.eyeBadge.textContent = s.eyeStatus.replace(/_/g, ' ');
      this.elements.eyeBadge.className = 'status-badge ' + (
        s.eyeStatus === 'READY_FOR_ML' ? 'status-attentive' :
        s.eyeStatus === 'NOT_RELIABLE' ? 'status-alert' : ''
      );
    }
    if (this.elements.drowsinessBadge) {
      this.elements.drowsinessBadge.textContent = s.drowsinessRisk.replace(/_/g, ' ');
      this.elements.drowsinessBadge.className = 'status-badge ' + (
        s.drowsinessRisk === 'DROWSINESS_ALERT' ? 'status-alert' :
        s.drowsinessRisk === 'WAITING_FOR_ANALYSIS' ? 'status-monitoring' : ''
      );
    }
  },

  updateMonitor() {
    const s = DriveSafeState.state;
    if (this.elements.monitorLeftEye) this.elements.monitorLeftEye.textContent = s.leftEyeCropValid ? 'LOCATED (READY)' : s.leftEyeState;
    if (this.elements.monitorRightEye) this.elements.monitorRightEye.textContent = s.rightEyeCropValid ? 'LOCATED (READY)' : s.rightEyeState;
    if (this.elements.monitorClosureDuration)
      this.elements.monitorClosureDuration.textContent = `${s.eyeClosureDuration.toFixed(1)} sec`;
    if (this.elements.monitorConfidence)
      this.elements.monitorConfidence.textContent = s.mlConfidence ? `${(s.mlConfidence * 100).toFixed(1)}%` : '—';
    if (this.elements.monitorDrowsinessRisk)
      this.elements.monitorDrowsinessRisk.textContent = s.drowsinessRisk.replace(/_/g, ' ');

    // Timer display
    if (this.elements.timerDuration)
      this.elements.timerDuration.textContent = `0${s.eyeClosureDuration.toFixed(1)}s`;
    if (this.elements.timerThreshold)
      this.elements.timerThreshold.textContent = `0${s.thresholdSeconds.toFixed(1)}s`;

    const progress = Math.min(100, Math.round((s.eyeClosureDuration / s.thresholdSeconds) * 100));
    if (this.elements.timerProgress) {
      this.elements.timerProgress.style.width = `${progress}%`;
      this.elements.timerProgress.style.background =
        progress >= 100 ? 'var(--status-red)' : progress >= 60 ? 'var(--status-yellow)' : 'var(--status-green)';
    }
    if (this.elements.timerProgressText) this.elements.timerProgressText.textContent = `${progress}%`;
  },

  updateAlert() {
    if (this.elements.alertOverlay) {
      this.elements.alertOverlay.classList.toggle('active', DriveSafeState.state.alertActive);
    }
  },

  populateCameraSelect(cameras) {
    if (!this.elements.cameraDeviceSelect) return;
    this.elements.cameraDeviceSelect.innerHTML = '<option value="default">Default System Camera</option>';
    cameras.forEach((cam) => {
      const opt = document.createElement('option');
      opt.value = cam.deviceId;
      opt.textContent = cam.label;
      this.elements.cameraDeviceSelect.appendChild(opt);
    });
    this.elements.cameraDeviceSelect.value = DriveSafeState.settings.cameraDevice || 'default';
  },

  showAlert() {
    DriveSafeState.showAlert();
    this.render();
  },

  dismissAlert() {
    DriveSafeState.dismissAlert();
    this.render();
  },
};
