const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");
const isDev = process.env.NODE_ENV === "development";
const log = require("electron-log");

log.transports.file.level = "info";
log.transports.file.file = path.join(app.getPath("userData"), "app.log");
log.transports.console.level = "info";

let mainWindow;
let backendProcess = null;
let healthCheckTimer = null;
const HEALTH_URL = "http://localhost:8080/api/application/health";
const HEALTH_POLL_INTERVAL = 2000;
const HEALTH_TIMEOUT_MS = 120000; // 2 minutes max wait

// ─── Backend startup ────────────────────────────────────────────────────────

function setupUserData() {
  const userImagesPath = path.join(app.getPath("userData"), "User_Images");
  if (!fs.existsSync(userImagesPath)) {
    fs.mkdirSync(userImagesPath, { recursive: true });
    log.info("Created User_Images folder at:", userImagesPath);
  }

  const defaultImageDest = path.join(userImagesPath, "default-visitor.png");
  if (!fs.existsSync(defaultImageDest)) {
    const defaultImageSrc = isDev
      ? path.join(__dirname, "../public/assets/default-visitor.png")
      : path.join(process.resourcesPath, "assets", "default-visitor.png");
    if (fs.existsSync(defaultImageSrc)) {
      fs.copyFileSync(defaultImageSrc, defaultImageDest);
      log.info("Copied default visitor image to userData");
    }
  }

  return userImagesPath;
}

function startBackend() {
  const userImagesPath = setupUserData();

  const jarPath = isDev
    ? path.join(__dirname, "../extraResources/spring-visitor-entry-0.0.1-SNAPSHOT.jar")
    : path.join(process.resourcesPath, "extraResources", "spring-visitor-entry-0.0.1-SNAPSHOT.jar");

  log.info("JAR path:", jarPath);
  log.info("User Images path:", userImagesPath);

  backendProcess = spawn(
    "java",
    [`-DUSER_IMAGES_PATH=${userImagesPath}${path.sep}`, "-jar", jarPath],
    { shell: true }
  );

  backendProcess.stdout.on("data", (d) => log.info("[Backend]", d.toString().trim()));
  backendProcess.stderr.on("data", (d) => log.error("[Backend ERR]", d.toString().trim()));
  backendProcess.on("error", (e) => {
    log.error("Backend spawn error:", e.message);
    sendToRenderer("backend:error", "Failed to start the backend. Is Java installed?");
  });
  backendProcess.on("close", (code) => {
    log.info("Backend exited with code", code);
    if (code !== 0 && code !== null) {
      sendToRenderer("backend:error", `Backend crashed (exit code ${code}). Check logs.`);
    }
  });
}

// ─── Health polling ──────────────────────────────────────────────────────────

function pollHealth(startedAt) {
  http.get(HEALTH_URL, { timeout: 3000 }, (res) => {
    if (res.statusCode === 200) {
      clearTimeout(healthCheckTimer);
      log.info("Backend is healthy ✅");
      sendToRenderer("backend:ready", null);
    } else {
      scheduleNextPoll(startedAt);
    }
    res.resume();
  }).on("error", () => {
    scheduleNextPoll(startedAt);
  });
}

function scheduleNextPoll(startedAt) {
  const elapsed = Date.now() - startedAt;
  if (elapsed >= HEALTH_TIMEOUT_MS) {
    log.error("Backend did not become healthy within timeout");
    sendToRenderer("backend:error", "Backend took too long to start. Check if Java is installed and the JAR is valid.");
    return;
  }

  const remaining = Math.ceil((HEALTH_TIMEOUT_MS - elapsed) / 1000);
  sendToRenderer("backend:starting", `Starting server... (${remaining}s remaining)`);
  healthCheckTimer = setTimeout(() => pollHealth(startedAt), HEALTH_POLL_INTERVAL);
}

// ─── Shutdown ────────────────────────────────────────────────────────────────

function stopBackend() {
  if (!backendProcess) return;

  http.get(
    "http://localhost:8080/api/application/shutdown-spring-backend-visitor-entry-pass",
    { timeout: 3000 },
    (res) => res.resume()
  ).on("error", () => {
    // Graceful HTTP shutdown failed — force kill
    if (backendProcess) backendProcess.kill("SIGTERM");
  });
}

// ─── IPC helpers ─────────────────────────────────────────────────────────────

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

// ─── Window ──────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false, // Don't flash blank window — show after content loads
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show window once the page has painted — no white flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.on("closed", () => {
    clearTimeout(healthCheckTimer);
    stopBackend();
    mainWindow = null;
  });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();

  if (isDev) {
    // In dev, backend is started manually — just signal ready immediately
    mainWindow.webContents.once("did-finish-load", () => {
      sendToRenderer("backend:ready", null);
    });
  } else {
    startBackend();
    // Wait for the page to load before starting health polls
    // so the renderer is ready to receive IPC messages
    mainWindow.webContents.once("did-finish-load", () => {
      const startedAt = Date.now();
      sendToRenderer("backend:starting", "Starting server...");
      pollHealth(startedAt);
    });
  }
});

app.on("window-all-closed", () => {
  clearTimeout(healthCheckTimer);
  if (process.platform !== "darwin") {
    if (backendProcess) backendProcess.kill("SIGTERM");
    app.quit();
  }
});
