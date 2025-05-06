const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";
const log = require("electron-log");
const http = require("http");
let mainWindow;
let backendProcess = null;

// Configure electron-log
log.transports.file.level = "info";
log.transports.file.file = path.join(app.getPath("userData"), "app.log");
log.transports.console.level = "info";

const startBackend = () => {
  console.log("Directry " + __dirname);
  console.log("App Path:", app.getAppPath());
  console.log("Resources Path:", process.resourcesPath);
  const jarPath = isDev
    ? path.join(
        __dirname,
        "../extraResources/spring-visitor-entry-0.0.1-SNAPSHOT.jar"
      )
    : path.join(
        process.resourcesPath,
        "extraResources",
        "spring-visitor-entry-0.0.1-SNAPSHOT.jar"
      );

  console.log("Resolved JAR Path:", jarPath);

  const backendProcess = require("child_process").spawn(
    "java",
    ["-jar", jarPath],
    { shell: true }
  );

  backendProcess.stdout.on("data", (data) => {
    log.info(`[Backend stdout]: ${data.toString()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    // console.error(`[Backend stderr]: ${data.toString()}`);
    log.error(`[Backend stderr]: ${data.toString()}`);
  });

  backendProcess.on("error", (error) => {
    // console.error(`Error starting backend: ${error.message}`);
    log.error(`Backend process error: ${error.message}`);
  });

  backendProcess.on("close", (code) => {
    // console.log(`Backend process exited with code ${code}`);
    log.info(`Backend process exited with code ${code}`);
  });

  return backendProcess;
};

// Function to stop the backend
function stopBackend() {
  const shutdownEndpoint =
    "http://localhost:8080/shutdown-spring-backend-visitor-entry-pass";

  http
    .get(shutdownEndpoint, (res) => {
      if (res.statusCode === 200) {
        // log.info("Backend shutdown initiated successfully.");
        mainWindow.webContents.send(
          "show-alert",
          "The backend is shutting down!"
        );
      } else {
        // log.error("Failed to initiate backend shutdown.");
        mainWindow.webContents.send(
          "show-alert",
          "Error: Could not shut down the backend."
        );
      }
    })
    .on("error", (error) => {
      // log.error("An error occurred during shutdown:", error);
      mainWindow.webContents.send(
        "show-alert",
        "Error: Unable to connect to the backend."
      );
    });
}

app.whenReady().then(() => {
  startUi();
  setTimeout(() => startBackend(), 500);
});

const startUi=()=>{
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    const reactBuildPath = path.join(__dirname, "../build/index.html");
    mainWindow.loadFile(reactBuildPath);
  }

  mainWindow.on("closed", () => {
    stopBackend();
    app.quit();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (backendProcess) {
      backendProcess.kill("SIGINT");
    }

    app.quit();
  }
});
