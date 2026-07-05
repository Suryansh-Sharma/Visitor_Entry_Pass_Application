import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Button, message, Select, Space, Tag, Typography } from "antd";
import { RetweetOutlined, VideoCameraOutlined } from "@ant-design/icons";
import Webcam from "react-webcam";

const { Text } = Typography;

function CameraCaptureComponent({ value = null, onChange, disabled = false }) {
  const webcamRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();

  // --- HARDWARE PERIPHERALS SYSTEM STATES ---
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isWebCamReady, setIsWebCamReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // 💡 STATE CIRCUIT BREAKER: Read directly from incoming form context values
  const currentImage = value ?? null;

  // Programmatic options schema array mapping
  const cameraOptions = useMemo(
    () =>
      devices.map((device) => ({
        value: device.deviceId,
        label: device.label || `Camera Module (${device.deviceId.slice(0, 5)})`,
      })),
    [devices],
  );

  // Pure device hardware lookup engine
  const updateDeviceList = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = mediaDevices.filter((d) => d.kind === "videoinput");

      setDevices(videoDevices);
      setSelectedDeviceId((current) => {
        if (current && videoDevices.some((d) => d.deviceId === current)) {
          return current;
        }
        return videoDevices[0]?.deviceId ?? null;
      });
    } catch (err) {
      console.error("Failed to enumerate active system capture hardware:", err);
    }
  }, []);

  // Main permission lookup and initialization lifecycle hook
  useEffect(() => {
    let isMounted = true;

    const initializeCameraSystem = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop()); // Instantly drop hook track to release peripheral lock

        if (isMounted) {
          await updateDeviceList();
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          messageApi.error(
            "Security alert: Optical hardware acquisition permissions rejected.",
          );
        }
      }
    };

    initializeCameraSystem();
    return () => {
      isMounted = false;
    };
  }, [updateDeviceList, messageApi]);

  // Handle runtime hardware device changes (e.g., unplugging/plugging webcams)
  useEffect(() => {
    const handleDeviceChange = () => updateDeviceList();
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleDeviceChange,
      );
    };
  }, [updateDeviceList]);

  const captureImage = () => {
    if (isCapturing || disabled || !webcamRef.current) return;
    setIsCapturing(true);

    setTimeout(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setIsCapturing(false);
        return;
      }

      // 💡 Dispatch straight up to the parent form context container
      onChange?.(imageSrc);
      setIsCapturing(false);
    }, 200);
  };

  const resetCapture = () => {
    if (disabled) return;
    onChange?.(null);
  };

  return (
    <div className="w-full">
      {contextHolder}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
        {/* VIEWPORT BOX 1: LIVE FEED */}
        <div className="flex flex-col items-center w-full">
          <Text className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mb-2 self-start pl-1">
            Live Stream Feed
          </Text>

          <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black w-[300px] h-[200px] flex items-center justify-center">
            {!disabled ? (
              <Webcam
                key={selectedDeviceId}
                ref={webcamRef}
                audio={false}
                mirrored
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                onUserMedia={() => setIsWebCamReady(true)}
                onUserMediaError={() => setIsWebCamReady(false)}
                className="w-full h-full object-cover"
                videoConstraints={{
                  deviceId: selectedDeviceId
                    ? { exact: selectedDeviceId }
                    : undefined,
                  width: 1280,
                  height: 720,
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center">
                <Text type="secondary" className="text-xs italic">
                  Camera interface sleeping: profile locked
                </Text>
              </div>
            )}

            {!isWebCamReady && !disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <Text
                  type="secondary"
                  className="text-xs animate-pulse font-medium"
                >
                  Initializing Peripheral Pipeline...
                </Text>
              </div>
            )}
          </div>

          {!disabled && cameraOptions.length > 0 && (
            <Select
              disabled={isCapturing}
              className="w-[300px] mt-3 text-xs"
              value={selectedDeviceId}
              onChange={(val) => {
                setIsWebCamReady(false);
                setSelectedDeviceId(val);
              }}
              options={cameraOptions}
            />
          )}
        </div>

        {/* VIEWPORT BOX 2: VALIDATION CANVAS MONITOR */}
        <div className="flex flex-col items-center w-full">
          <Text className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mb-2 self-start pl-1">
            Verification Snapshot
          </Text>

          <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white w-[300px] h-[200px] flex items-center justify-center shadow-inner">
            {currentImage ? (
              <>
                <img
                  src={
                    currentImage.startsWith("data:")
                      ? currentImage
                      : `http://localhost:8080/api/v1/file/image-by-name/${currentImage}`
                  }
                  alt="Visitor Verification Monitor"
                  className="w-full h-full object-cover"
                />
                <Tag
                  color="success"
                  className="absolute top-2.5 right-2 font-bold text-[10px] uppercase rounded-md tracking-wider shadow-sm m-0"
                >
                  ✓ Indexed
                </Tag>
              </>
            ) : (
              <Text type="secondary" className="text-xs italic text-slate-400">
                Canvas empty: awaiting capture trigger
              </Text>
            )}
          </div>

          <div className="w-[300px] flex items-center justify-between mt-3">
            <Space size="small">
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                loading={isCapturing}
                onClick={captureImage}
                disabled={!isWebCamReady || disabled}
                className="bg-blue-600 hover:bg-blue-500 border-none rounded-lg text-xs font-semibold shadow-sm h-8"
              >
                Snapshot
              </Button>

              {currentImage && !disabled && (
                <Button
                  icon={<RetweetOutlined />}
                  onClick={resetCapture}
                  className="rounded-lg text-xs font-semibold h-8 text-slate-600 border-slate-300"
                >
                  Retake
                </Button>
              )}
            </Space>

            <Tag
              color={isWebCamReady && !disabled ? "success" : "default"}
              className="font-bold text-[9px] uppercase tracking-wide rounded-md m-0"
            >
              {isWebCamReady && !disabled ? "Hardware Ready" : "Standby"}
            </Tag>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraCaptureComponent;
