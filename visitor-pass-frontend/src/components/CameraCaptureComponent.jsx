import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button, message, Select, Space, Tag, Typography } from "antd";
import { RetweetOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { CameraContext } from "../context/CameraContext";

const { Text } = Typography;

function CameraCaptureComponent({ value = null, onChange, disabled = false }) {
  const { stream, devices, selectedDeviceId, isReady, error, switchDevice } =
    useContext(CameraContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  const currentImage = value ?? null;

  const cameraOptions = useMemo(
    () =>
      devices.map((device) => ({
        value: device.deviceId,
        label: device.label || `Camera Module (${device.deviceId.slice(0, 5)})`,
      })),
    [devices],
  );

  // Attach the already-live, app-wide stream to this page's <video> element.
  // No getUserMedia call here — the camera was already opened once by
  // CameraProvider at app startup, so this is just a DOM operation.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (error && !hasShownError) {
      setHasShownError(true);
      messageApi.error(
        "Security alert: Optical hardware acquisition permissions rejected.",
      );
    }
  }, [error, hasShownError, messageApi]);

  const captureImage = () => {
    if (isCapturing || disabled || !videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageSrc = canvas.toDataURL("image/jpeg", 0.92);

    onChange?.(imageSrc);
    setIsCapturing(false);
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
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-4 text-center">
                <Text type="secondary" className="text-xs italic">
                  Camera interface sleeping: profile locked
                </Text>
              </div>
            )}

            {!isReady && !disabled && (
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
              onChange={(val) => switchDevice(val)}
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
                disabled={!isReady || disabled}
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
              color={isReady && !disabled ? "success" : "default"}
              className="font-bold text-[9px] uppercase tracking-wide rounded-md m-0"
            >
              {isReady && !disabled ? "Hardware Ready" : "Standby"}
            </Tag>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraCaptureComponent;
