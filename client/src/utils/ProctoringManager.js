class ProctoringManager {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.snapshots = [];
    this.startedAt = null;
    this.videoRef = null;
    this.snapshotInterval = null;
    this.warningCallback = null;
    this.currentSection = "Setup";
    this.currentQuestion = 0;
  }

  // Called from React to initialize callbacks and video ref
  init(videoRef, warningCallback) {
    this.videoRef = videoRef;
    this.warningCallback = warningCallback;
  }

  setCurrentContext(section, question) {
    this.currentSection = section;
    this.currentQuestion = question;
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.startedAt = new Date();
    this.violations = [];
    this.snapshots = [];

    // Bind event listeners
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleResize = this.handleResize.bind(this);

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleBlur);
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    window.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("contextmenu", this.handleContextMenu);
    window.addEventListener("resize", this.handleResize);

    // Start webcam snapshots every 60s
    this.takeSnapshot(); // take one immediately
    this.snapshotInterval = setInterval(() => this.takeSnapshot(), 60000);
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("blur", this.handleBlur);
    document.removeEventListener("fullscreenchange", this.handleFullscreenChange);
    window.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("contextmenu", this.handleContextMenu);
    window.removeEventListener("resize", this.handleResize);

    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
  }

  recordViolation(type, customMessage) {
    if (!this.isActive) return;

    const violation = {
      violationType: type,
      timestamp: new Date(),
      sectionName: this.currentSection,
      questionNumber: this.currentQuestion,
    };
    
    this.violations.push(violation);

    if (this.warningCallback) {
      this.warningCallback(violation, this.violations.length, customMessage);
    }
  }

  // --- Event Handlers ---
  handleVisibilityChange() {
    if (document.visibilityState === "hidden") {
      this.recordViolation("Tab Switch", "You switched tabs or minimized the browser.");
    }
  }

  handleBlur() {
    this.recordViolation("Window Blur", "The test window lost focus.");
  }

  handleFullscreenChange() {
    if (!document.fullscreenElement) {
      this.recordViolation("Exited Fullscreen", "You exited fullscreen mode.");
    }
  }

  handleKeyDown(e) {
    // PrintScreen
    if (e.key === "PrintScreen") {
      e.preventDefault();
      this.recordViolation("PrintScreen", "Screenshots are not allowed.");
    }
    // Ctrl/Cmd + C or V
    if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "C" || e.key === "V")) {
      e.preventDefault();
      this.recordViolation("Copy/Paste", "Copy and Paste shortcuts are disabled.");
    }
    // Alt+Tab / Cmd+Tab cannot be reliably captured in JS, blur/visibilitychange handles it.
  }

  handleContextMenu(e) {
    e.preventDefault();
    this.recordViolation("Right Click", "Right-clicking is disabled during the test.");
  }

  handleResize() {
    // DevTools detection heuristic
    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      this.recordViolation("DevTools Opened", "Developer tools are not allowed.");
    }
  }

  takeSnapshot() {
    if (!this.videoRef || !this.videoRef.current) return;
    
    const video = this.videoRef.current;
    if (video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Low quality JPEG to save space
    const base64 = canvas.toDataURL("image/jpeg", 0.5);
    
    this.snapshots.push({
      timestamp: new Date(),
      imageBase64: base64,
    });
  }

  getReportPayload(diagnosticResultId, autoSubmitted = false) {
    return {
      diagnosticResultId,
      violations: this.violations,
      totalViolations: this.violations.length,
      autoSubmitted,
      webcamSnapshots: this.snapshots,
      startedAt: this.startedAt,
    };
  }
}

// Export as singleton
export const proctorManager = new ProctoringManager();
