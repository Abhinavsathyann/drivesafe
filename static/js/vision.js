/**
 * DriveSafe AI — Computer Vision Module (Phase 3)
 * Real-Time Face Detection, Facial Landmarks & Eye Localization
 * 
 * Runs exclusively in the browser for privacy and ultra-low latency.
 * No images are transmitted to a server for detection.
 */

const DriveSafeVision = {
  faceLandmarker: null,
  runningMode: "VIDEO",
  lastVideoTime: -1,

  // Standard MediaPipe FaceMesh indices for eyes
  // Note: "Left" and "Right" refer to the user's physical left and right.
  // In a mirrored camera preview, the user's physical left eye appears on the left side of the screen.
  LEFT_EYE_INDICES: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  RIGHT_EYE_INDICES: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],

  // Specific points for optional EAR (Eye Aspect Ratio) calculation (diagnostic only)
  LEFT_EAR_INDICES: [33, 160, 158, 133, 153, 144], 
  RIGHT_EAR_INDICES: [362, 385, 387, 263, 373, 380],

  async init() {
    try {
      console.log("[DriveSafeVision] Initializing FaceLandmarker...");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: false,
        runningMode: this.runningMode,
        numFaces: 3 // Set >1 to detect MULTIPLE faces condition
      });
      console.log("[DriveSafeVision] FaceLandmarker ready.");
      DriveSafeState.state.visionReady = true;
    } catch (err) {
      console.error("[DriveSafeVision] Failed to initialize:", err);
      DriveSafeState.state.visionReady = false;
    }
  },

  /**
   * Process a single video frame. 
   * This is invoked by the Phase 2 camera loop.
   */
  processFrame(videoElement, timestamp) {
    if (!this.faceLandmarker) return null;
    
    const startTime = performance.now();
    let results = null;

    try {
      if (this.lastVideoTime !== videoElement.currentTime) {
        this.lastVideoTime = videoElement.currentTime;
        results = this.faceLandmarker.detectForVideo(videoElement, timestamp);
      }
    } catch (err) {
      console.warn("[DriveSafeVision] Error during detection:", err);
      return null;
    }

    const processTimeMs = performance.now() - startTime;
    DriveSafeState.state.processTimeMs = processTimeMs.toFixed(1);

    return this.analyzeResults(results, videoElement.videoWidth, videoElement.videoHeight);
  },

  /**
   * Analyze the FaceLandmarker results to extract our structured data contract.
   */
  analyzeResults(results, width, height) {
    if (!results || !results.faceLandmarks) {
      return this.createEmptyContract();
    }

    const numFaces = results.faceLandmarks.length;
    DriveSafeState.state.faceCount = numFaces;

    if (numFaces === 0) {
      DriveSafeState.updateFaceStatus('NOT_DETECTED', false);
      DriveSafeState.updateEyeStatus('WAITING');
      return this.createEmptyContract(0);
    } 
    
    if (numFaces > 1) {
      DriveSafeState.updateFaceStatus('MULTIPLE_FACES', false);
      DriveSafeState.updateEyeStatus('UNCERTAIN');
      return this.createEmptyContract(numFaces);
    }

    // Exactly 1 Face
    DriveSafeState.updateFaceStatus('DETECTED', true);
    DriveSafeState.updateEyeStatus('LOCATING');

    const landmarks = results.faceLandmarks[0];
    
    // Calculate face bounding box
    const faceBbox = this.getBoundingBox(landmarks, width, height);
    
    // Check face distance/quality heuristic (simple proxy: face width vs frame width)
    let faceQuality = 'GOOD';
    const faceRatio = faceBbox.width / width;
    if (faceRatio < 0.1) faceQuality = 'TOO_FAR';
    if (faceRatio > 0.8) faceQuality = 'TOO_CLOSE';
    DriveSafeState.state.faceQuality = faceQuality;

    // Calculate eye bounding boxes
    const paddingX = DriveSafeState.settings.eyePaddingX || 0.3;
    const paddingY = DriveSafeState.settings.eyePaddingY || 0.3;

    const leftEyeBbox = this.getBoundingBoxForIndices(landmarks, this.LEFT_EYE_INDICES, width, height, paddingX, paddingY);
    const rightEyeBbox = this.getBoundingBoxForIndices(landmarks, this.RIGHT_EYE_INDICES, width, height, paddingX, paddingY);

    // Optional Diagnostic EAR
    const leftEAR = this.calculateEAR(landmarks, this.LEFT_EAR_INDICES);
    const rightEAR = this.calculateEAR(landmarks, this.RIGHT_EAR_INDICES);
    DriveSafeState.state.leftEAR = leftEAR.toFixed(2);
    DriveSafeState.state.rightEAR = rightEAR.toFixed(2);

    // Validate crops
    const leftValid = this.isCropValid(leftEyeBbox, width, height);
    const rightValid = this.isCropValid(rightEyeBbox, width, height);

    DriveSafeState.state.leftEyeFound = true;
    DriveSafeState.state.rightEyeFound = true;
    DriveSafeState.state.leftEyeCropValid = leftValid;
    DriveSafeState.state.rightEyeCropValid = rightValid;

    if (leftValid && rightValid) {
      DriveSafeState.updateEyeStatus('READY_FOR_ML', 'LOCATED', 'LOCATED');
    } else {
      DriveSafeState.updateEyeStatus('NOT_RELIABLE', 'INVALID', 'INVALID');
    }

    // Structure Output Contract for Phase 4 / Phase 5 ML Integration
    return {
      timestamp: Date.now(),
      face: {
        detected: true,
        count: 1,
        boundingBox: faceBbox
      },
      eyes: {
        left: {
          detected: true,
          boundingBox: leftEyeBbox,
          // image: (Reserved for extraction if needed)
        },
        right: {
          detected: true,
          boundingBox: rightEyeBbox,
          // image: (Reserved for extraction if needed)
        }
      },
      quality: {
        face: faceQuality,
        leftEye: leftValid ? 'GOOD' : 'INVALID',
        rightEye: rightValid ? 'GOOD' : 'INVALID'
      },
      rawLandmarks: landmarks // Passed along for drawing overlay
    };
  },

  createEmptyContract(count = 0) {
    DriveSafeState.state.leftEyeFound = false;
    DriveSafeState.state.rightEyeFound = false;
    DriveSafeState.state.leftEyeCropValid = false;
    DriveSafeState.state.rightEyeCropValid = false;
    DriveSafeState.state.leftEAR = 0;
    DriveSafeState.state.rightEAR = 0;
    DriveSafeState.state.faceQuality = 'UNKNOWN';

    return {
      timestamp: Date.now(),
      face: { detected: false, count: count, boundingBox: null },
      eyes: {
        left: { detected: false, boundingBox: null },
        right: { detected: false, boundingBox: null }
      },
      quality: { face: 'UNKNOWN', leftEye: 'UNKNOWN', rightEye: 'UNKNOWN' },
      rawLandmarks: null
    };
  },

  getBoundingBox(landmarks, imgW, imgH) {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    landmarks.forEach(lm => {
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
    });
    return {
      x: Math.max(0, minX * imgW),
      y: Math.max(0, minY * imgH),
      width: Math.min(imgW, (maxX - minX) * imgW),
      height: Math.min(imgH, (maxY - minY) * imgH)
    };
  },

  getBoundingBoxForIndices(landmarks, indices, imgW, imgH, padX, padY) {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    indices.forEach(idx => {
      const lm = landmarks[idx];
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
    });

    const w = (maxX - minX) * imgW;
    const h = (maxY - minY) * imgH;
    
    // Add padding
    const dx = w * padX;
    const dy = h * padY;

    return {
      x: Math.max(0, (minX * imgW) - dx),
      y: Math.max(0, (minY * imgH) - dy),
      width: w + (dx * 2),
      height: h + (dy * 2)
    };
  },

  calculateEAR(landmarks, indices) {
    // EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];
    const p4 = landmarks[indices[3]];
    const p5 = landmarks[indices[4]];
    const p6 = landmarks[indices[5]];

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const num = dist(p2, p6) + dist(p3, p5);
    const den = 2.0 * dist(p1, p4);
    
    return den === 0 ? 0 : num / den;
  },

  isCropValid(bbox, imgW, imgH) {
    if (!bbox) return false;
    if (bbox.width <= 0 || bbox.height <= 0) return false;
    // Must be reasonably sized (e.g., > 10px) and inside bounds
    if (bbox.width < 10 || bbox.height < 5) return false;
    if (bbox.x > imgW || bbox.y > imgH) return false;
    if (bbox.x + bbox.width < 0 || bbox.y + bbox.height < 0) return false;
    return true;
  },

  drawOverlay(canvas, result, mirror) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!DriveSafeState.settings.showVisionOverlay || !result || !result.face.detected) {
      return;
    }

    ctx.save();
    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Draw Face Bounding Box
    const fbox = result.face.boundingBox;
    ctx.strokeStyle = "rgba(0, 255, 0, 0.4)";
    ctx.lineWidth = 2;
    ctx.strokeRect(fbox.x, fbox.y, fbox.width, fbox.height);

    // Draw Landmarks
    if (result.rawLandmarks) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
      // Just draw eye landmarks to reduce clutter
      this.LEFT_EYE_INDICES.forEach(idx => {
        const p = result.rawLandmarks[idx];
        ctx.fillRect(p.x * canvas.width - 1, p.y * canvas.height - 1, 2, 2);
      });
      this.RIGHT_EYE_INDICES.forEach(idx => {
        const p = result.rawLandmarks[idx];
        ctx.fillRect(p.x * canvas.width - 1, p.y * canvas.height - 1, 2, 2);
      });
    }

    // Draw Eye Bounding Boxes
    ctx.strokeStyle = "rgba(255, 165, 0, 0.8)";
    const lbox = result.eyes.left.boundingBox;
    if (lbox) ctx.strokeRect(lbox.x, lbox.y, lbox.width, lbox.height);
    
    const rbox = result.eyes.right.boundingBox;
    if (rbox) ctx.strokeRect(rbox.x, rbox.y, rbox.width, rbox.height);

    ctx.restore();
  }
};
