const { app, BrowserWindow, Menu } = require("electron");
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
let weStartedBackend = false; // only kill/shutdown a backend process we spawned ourselves
const HEALTH_POLL_INTERVAL = 2000;
const HEALTH_TIMEOUT_MS = 120000; // 2 minutes max wait
const BACKEND_PORT = process.env.BACKEND_PORT || "8080";
const BACKEND_BASE_URL = `http://localhost:${BACKEND_PORT}`;

// ─── Backend startup ────────────────────────────────────────────────────────

function setupUserData() {
  const userDataPath = app.getPath("userData");
  const userImagesPath = path.join(userDataPath, "User_Images");
  const databasePath = path.join(userDataPath, "visitor-entry.db");
  fs.mkdirSync(userImagesPath, { recursive: true });
  log.info("User data folder:", userDataPath);
  log.info("SQLite DB path:", databasePath);
  log.info("User Images path:", userImagesPath);

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

  return { userImagesPath, databasePath };
}

function getBackendJarPath() {
  if (isDev) {
    return path.join(__dirname, "../../spring-visitor-entry/target/spring-visitor-entry-0.0.1-SNAPSHOT.jar");
  }
  return path.join(process.resourcesPath, "backend", "spring-visitor-entry-0.0.1-SNAPSHOT.jar");
}

function getJavaCommand() {
  const bundledJava = process.platform === "win32"
    ? path.join(process.resourcesPath, "jre", "bin", "java.exe")
    : path.join(process.resourcesPath, "jre", "bin", "java");
  return fs.existsSync(bundledJava) ? bundledJava : "java";
}

function checkBackendHealthy() {
  return new Promise((resolve) => {
    http.get(`${BACKEND_BASE_URL}/api/application/health`, { timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    }).on("error", () => resolve(false));
  });
}

let stderrTail = "";

function startBackend() {
  const { userImagesPath, databasePath } = setupUserData();
  const jarPath = getBackendJarPath();
  const javaCommand = getJavaCommand();

  log.info("JAR path:", jarPath);
  log.info("Java command:", javaCommand);

  if (!fs.existsSync(jarPath)) {
    const message = `Backend JAR not found at ${jarPath}. Build Spring first.`;
    log.error(message);
    sendToRenderer("backend:error", message);
    return;
  }

  weStartedBackend = true;
  stderrTail = "";
  backendProcess = spawn(
    javaCommand,
    [
      `-DUSER_IMAGES_PATH=${userImagesPath}${path.sep}`,
      `-DSQLITE_DB_PATH=${databasePath}`,
      `-Dserver.port=${BACKEND_PORT}`,
      "-Dtelegram.bot.enabled=false",
      "-jar",
      jarPath,
    ],
    { shell: false }
  );

  backendProcess.stdout.on("data", (d) => log.info("[Backend]", d.toString().trim()));
  backendProcess.stderr.on("data", (d) => {
    const text = d.toString();
    log.error("[Backend ERR]", text.trim());
    // Keep a small rolling tail so a crash message can explain *why*, not just the exit code
    stderrTail = (stderrTail + text).slice(-4000);
  });
  backendProcess.on("error", (e) => {
    log.error("Backend spawn error:", e.message);
    sendToRenderer("backend:error", "Failed to start the backend. Bundle a JRE or install Java 21+.");
  });
  backendProcess.on("close", (code) => {
    log.info("Backend exited with code", code);
    backendProcess = null;
    if (code !== 0 && code !== null) {
      const portConflict = /BindException|Address already in use|Port \d+ was already in use/i.test(stderrTail);
      const message = portConflict
        ? `Backend couldn't start because port ${BACKEND_PORT} is already used by another application. Close whatever is using it and restart.`
        : `Backend crashed (exit code ${code}). Check logs.`;
      sendToRenderer("backend:error", message);
    }
  });
}

async function startBackendIfNeeded() {
  const alreadyHealthy = await checkBackendHealthy();
  if (alreadyHealthy) {
    // A backend is already up on this port (e.g. left over from a previous
    // ungraceful shutdown, or a dev instance) — reuse it instead of spawning
    // a second one that would just fail to bind the port.
    log.info(`Detected an already-running, healthy backend on port ${BACKEND_PORT} — reusing it.`);
    weStartedBackend = false;
    return;
  }
  startBackend();
}

// ─── Health polling ──────────────────────────────────────────────────────────

function pollHealth(startedAt) {
  http.get(`${BACKEND_BASE_URL}/api/application/health`, { timeout: 3000 }, (res) => {
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
  // Never touch a backend we didn't spawn ourselves (e.g. a reused pre-existing instance).
  if (!weStartedBackend || !backendProcess) return;

  http.get(
    `${BACKEND_BASE_URL}/api/application/shutdown-spring-backend-visitor-entry-pass`,
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

  // Hide the browser-style right-click context menu ("Inspect Element", etc.)
  mainWindow.webContents.on("context-menu", (event) => {
    event.preventDefault();
  });

  // Block devtools/reload shortcuts in production so the app doesn't feel/behave like a browser
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (isDev) return;
    const key = input.key.toLowerCase();
    const blocked =
      key === "f12" ||
      (input.control && input.shift && key === "i") ||
      (input.control && key === "r") ||
      key === "f5";
    if (blocked) {
      event.preventDefault();
    }
  });

  mainWindow.on("closed", () => {
    clearTimeout(healthCheckTimer);
    stopBackend();
    mainWindow = null;
  });
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();

    if (isDev) {
      // In dev, backend is started manually — just signal ready immediately
      mainWindow.webContents.once("did-finish-load", () => {
        sendToRenderer("backend:ready", null);
      });
    } else {
      // Wait for the page to load before starting health polls
      // so the renderer is ready to receive IPC messages
      mainWindow.webContents.once("did-finish-load", () => {
        sendToRenderer("backend:starting", "Starting server...");
        startBackendIfNeeded().then(() => {
          pollHealth(Date.now());
        });
      });
    }
  });

  app.on("window-all-closed", () => {
    clearTimeout(healthCheckTimer);
    stopBackend();
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
