import { useEffect, useState } from "react";

const isElectron = typeof window !== "undefined" && !!window.electron;

export default function BackendGate({ children }) {
  const [status, setStatus] = useState(
    // In browser dev mode (no Electron), assume backend is already running
    isElectron ? "starting" : "ready"
  );
  const [statusMsg, setStatusMsg] = useState("Starting server...");

  useEffect(() => {
    if (!isElectron) return;

    window.electron.onBackendReady(() => setStatus("ready"));
    window.electron.onBackendError((msg) => {
      setStatusMsg(msg || "Backend failed to start.");
      setStatus("error");
    });
    window.electron.onBackendStarting((msg) => {
      if (msg) setStatusMsg(msg);
    });

    return () => {
      window.electron.removeAllListeners("backend:ready");
      window.electron.removeAllListeners("backend:starting");
      window.electron.removeAllListeners("backend:error");
    };
  }, []);

  if (status === "ready") return children;

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-6 p-8">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-red-400">Backend Failed to Start</h1>
        <p className="text-slate-300 text-center max-w-md text-sm">{statusMsg}</p>
        <p className="text-slate-500 text-xs text-center max-w-sm">
          Make sure Java is installed on this machine. Check the log file in your app data folder for details.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // status === "starting"
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
        </div>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight">
          Visitor Entry Pass
        </h1>
        <p className="text-slate-400 text-sm">{statusMsg}</p>
      </div>
      <p className="text-slate-600 text-xs">
        Starting the application server, please wait…
      </p>
    </div>
  );
}
