const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Send data to the main process
  send: (channel, data) => ipcRenderer.send(channel, data),

  // Receive data from the main process
  receive: (channel, func) => ipcRenderer.on(channel, (event, data) => func(data)),
});
