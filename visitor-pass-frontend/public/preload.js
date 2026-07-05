const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, func) =>
    ipcRenderer.on(channel, (_event, data) => func(data)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Backend lifecycle — used by BackendGate
  onBackendReady: (cb) => ipcRenderer.once("backend:ready", cb),
  onBackendStarting: (cb) => ipcRenderer.on("backend:starting", (_e, msg) => cb(msg)),
  onBackendError: (cb) => ipcRenderer.once("backend:error", (_e, msg) => cb(msg)),
});
