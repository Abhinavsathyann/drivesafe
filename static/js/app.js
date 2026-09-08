/**
 * DriveSafe AI — Application Controller & Event Wiring (Vanilla JS)
 * Phase 1 & Phase 2 Foundation
 */

function initializeApplication() {
  DriveSafeState.init();
  DriveSafeUI.init();
  attachEventListeners();

  // Enumerate cameras if supported
  if (DriveSafeCamera.isSupported()) {
    DriveSafeCamera.enumerateDevices().then((devices) => {
      if (devices.length > 0) {
        DriveSafeState.setAvailableCameras(devices);
        DriveSafeUI.populateCameraSelect(devices);
      }
    });
  }

  // Handle unexpected track ending
  window.onCameraTrackEnded = () => {
    stopMonitoring();
    DriveSafeState.state.cameraStatus = 'ERROR';
    DriveSafeState.state.cameraError = 'Camera disconnected unexpectedly.';
    DriveSafeUI.render();
  };

  console.log('DriveSafe AI Phase 2 Camera Pipeline initialized successfully.');
}

function attachEventListeners() {
  // Navigation
  const navMap = {
    'nav-dashboard': 'dashboard',
    'nav-monitor': 'monitor',
    'nav-sessions': 'sessions',
    'nav-settings': 'settings',
    'nav-about': 'about',
  };

  Object.entries(navMap).forEach(([btnId, tabId]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => DriveSafeUI.showTab(tabId));
    }
  });

  // Main CTA (Header)
  const cta = document.getElementById('main-nav-cta');
  if (cta) {
    cta.addEventListener('click', () => {
      if (DriveSafeState.state.monitoring) {
        stopMonitoring();
      } else {
        startMonitoring();
      }
    });
  }

  // Dashboard CTA
  const dashCta = document.getElementById('dashboard-start-monitoring-btn');
  if (dashCta) {
    dashCta.addEventListener('click', () => {
      startMonitoring();
      DriveSafeUI.showTab('monitor');
    });
  }

  // Monitor CTA
  const monitorCta = document.getElementById('monitor-start-monitoring-btn');
  if (monitorCta) {
    monitorCta.addEventListener('click', () => {
      if (DriveSafeState.state.monitoring) {
        stopMonitoring();
      } else {
        startMonitoring();
      }
    });
  }

  // Alert Dialog buttons
  const alertDismiss = document.getElementById('btn-alert-dismiss');
  if (alertDismiss) {
    alertDismiss.addEventListener('click', () => dismissAlert());
  }

  const alertStop = document.getElementById('btn-alert-stop');
  if (alertStop) {
    alertStop.addEventListener('click', () => {
      stopMonitoring();
      dismissAlert();
    });
  }

  // Test Alert preview button
  const testAlertBtn = document.getElementById('test-alert-btn');
  if (testAlertBtn) {
    testAlertBtn.addEventListener('click', () => showAlert());
  }

  // Mirror toggle
  const mirrorToggle = document.getElementById('mirror-preview-toggle');
  if (mirrorToggle) {
    mirrorToggle.addEventListener('change', (e) => {
      DriveSafeState.saveSettings({ mirrorCamera: e.target.checked });
      DriveSafeUI.render();
    });
  }

  // Camera device selector in monitor
  const camSelect = document.getElementById('camera-device-select');
  if (camSelect) {
    camSelect.addEventListener('change', async (e) => {
      DriveSafeState.saveSettings({ cameraDevice: e.target.value });
      if (DriveSafeState.state.monitoring) {
        await startMonitoring();
      }
    });
  }

  // Diagnostics toggle
  const diagToggle = document.getElementById('toggle-diagnostics-btn');
  const diagPanel = document.getElementById('diagnostics-panel');
  if (diagToggle && diagPanel) {
    diagToggle.addEventListener('click', () => {
      const isHidden = diagPanel.style.display === 'none' || !diagPanel.style.display;
      diagPanel.style.display = isHidden ? 'block' : 'none';
      diagToggle.textContent = isHidden ? 'Hide Diagnostics' : 'Developer Diagnostics';
    });
  }

  // Settings form
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSettingsFromForm();
    });
  }
}

async function startMonitoring() {
  const videoEl = document.getElementById('camera-video');
  DriveSafeState.startMonitoring();
  DriveSafeUI.render();

  try {
    const stream = await DriveSafeCamera.startStream(
      videoEl,
      DriveSafeState.settings.cameraDevice
    );

    // Wait for video metadata to read true dimensions
    if (videoEl.videoWidth > 0) {
      onVideoReady(videoEl);
    } else {
      videoEl.onloadedmetadata = () => onVideoReady(videoEl);
    }

    // Refresh devices list now that permission is granted
    const devices = await DriveSafeCamera.enumerateDevices();
    if (devices.length > 0) {
      DriveSafeState.setAvailableCameras(devices);
      DriveSafeUI.populateCameraSelect(devices);
    }
  } catch (err) {
    console.error('Camera startup error:', err);
    DriveSafeCamera.stopStream();
    DriveSafeState.onCameraError(err);
    DriveSafeUI.render();
  }
}

function onVideoReady(videoEl) {
  DriveSafeState.onCameraStarted(videoEl.videoWidth, videoEl.videoHeight);
  DriveSafeUI.render();

  // Start Phase 2 frame pipeline extraction loop
  DriveSafeCamera.startFramePipeline(
    DriveSafeState.settings.targetFPS || 10,
    (frame) => {
      // Future Phase 3 hook:
      // frame.imageData ready for face & eye detection
    },
    (diagnostics) => {
      DriveSafeState.setDiagnostics(diagnostics);
      DriveSafeUI.updateCameraUI();
    }
  );
}

function stopMonitoring() {
  DriveSafeCamera.stopStream();
  DriveSafeState.stopMonitoring();
  DriveSafeUI.render();
}

function showAlert() {
  DriveSafeUI.showAlert();
}

function dismissAlert() {
  DriveSafeUI.dismissAlert();
}

function saveSettingsFromForm() {
  const threshold = parseFloat(document.getElementById('input-threshold')?.value || '5.0');
  const sound = document.getElementById('input-sound')?.checked ?? true;
  const volume = parseInt(document.getElementById('input-volume')?.value || '80', 10);
  const targetFPS = parseInt(document.getElementById('input-fps')?.value || '10', 10);

  DriveSafeState.saveSettings({
    thresholdSeconds: threshold,
    alertSound: sound,
    alertVolume: volume,
    targetFPS: targetFPS,
  });

  DriveSafeUI.render();
  alert('Settings saved successfully.');
}

// Auto-run initialization on DOM ready
document.addEventListener('DOMContentLoaded', initializeApplication);
