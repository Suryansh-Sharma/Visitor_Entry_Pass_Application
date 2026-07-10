import { createContext, useCallback, useEffect, useRef, useState } from "react";

export const CameraContext = createContext();

/**
 * Owns a single, long-lived camera MediaStream for the entire app session.
 * The stream is requested once here and never stopped/restarted just because
 * a page using the camera mounts/unmounts — pages just attach the already-live
 * stream to their own <video> element, which is effectively instant instead
 * of re-negotiating hardware access every time.
 */
export function CameraProvider({ children }) {
  const [stream, setStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  const refreshDeviceList = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(mediaDevices.filter((d) => d.kind === "videoinput"));
    } catch (err) {
      console.error("Failed to enumerate camera devices:", err);
    }
  }, []);

  const openStream = useCallback(async (deviceId) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: 1280,
          height: 720,
        },
      });

      // Swap in the new stream, then stop the old one (avoid a flash of no-stream).
      const previousStream = streamRef.current;
      streamRef.current = newStream;
      setStream(newStream);
      setIsReady(true);
      setError(null);

      const activeDeviceId = newStream.getVideoTracks()[0]?.getSettings()?.deviceId;
      if (activeDeviceId) setSelectedDeviceId(activeDeviceId);

      if (previousStream) {
        previousStream.getTracks().forEach((track) => track.stop());
      }

      await refreshDeviceList();
    } catch (err) {
      console.error("Unable to start camera stream:", err);
      setIsReady(false);
      setError(err);
    }
  }, [refreshDeviceList]);

  // Start the camera exactly once, when the provider first mounts (i.e. once
  // the main app UI is up) — it then stays alive for the rest of the session.
  useEffect(() => {
    openStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleDeviceChange = () => refreshDeviceList();
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [refreshDeviceList]);

  // Only ever stopped if the whole app tears down (window close) — not on
  // navigation between pages, since CameraProvider lives above the router.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const switchDevice = useCallback((deviceId) => {
    openStream(deviceId);
  }, [openStream]);

  return (
    <CameraContext.Provider
      value={{ stream, devices, selectedDeviceId, isReady, error, switchDevice }}
    >
      {children}
    </CameraContext.Provider>
  );
}
