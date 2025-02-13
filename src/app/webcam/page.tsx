"use client";

import React, { useState, useRef, useCallback } from "react";
import { Camera, Pause, Play, RefreshCw } from "lucide-react";

const WebcamDiagnostics = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDevice, setActiveDevice] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>("");
  const [capabilities, setCapabilities] =
    useState<MediaTrackCapabilities | null>(null);
  const [settings, setSettings] = useState<MediaTrackSettings | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const listCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !activeDevice) {
        setActiveDevice(videoDevices[0].deviceId);
      }
    } catch {
      setError("Failed to list cameras");
    }
  }, [activeDevice]);

  React.useEffect(() => {
    listCameras();
  }, [listCameras]);

  const startStream = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: activeDevice,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setIsStreaming(true);
      setError("");

      // Get capabilities and settings
      const track = stream.getVideoTracks()[0];
      setCapabilities(track.getCapabilities());
      setSettings(track.getSettings());
    } catch {
      setError("Failed to access camera");
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = "webcam-test.png";
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="relative border border-gray-300 p-6 rounded-lg">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Webcam Diagnostics
          </h1>

          {/* Camera Selection */}
          <div className="mb-6">
            <select
              value={activeDevice}
              onChange={(e) => setActiveDevice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                </option>
              ))}
            </select>
          </div>

          {/* Video Preview */}
          <div className="relative aspect-video mb-6 bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-6 justify-center">
            <button
              onClick={isStreaming ? stopStream : startStream}
              className={`font-mono text-sm px-4 py-2 rounded-md transition-colors flex items-center gap-2
                ${
                  isStreaming
                    ? "bg-red-50 hover:bg-red-100 border-red-200 border"
                    : "bg-blue-50 hover:bg-blue-100 border-blue-200 border"
                }`}
            >
              {isStreaming ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isStreaming ? "Stop" : "Start"}
            </button>

            <button
              onClick={captureSnapshot}
              disabled={!isStreaming}
              className="font-mono text-sm px-4 py-2 rounded-md transition-colors
                bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50
                disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Capture
            </button>

            <button
              onClick={listCameras}
              className="font-mono text-sm px-4 py-2 rounded-md transition-colors
                bg-white hover:bg-gray-50 border border-gray-300 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Capabilities & Settings */}
          {settings && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg font-mono text-sm">
              <div>
                <h2 className="font-bold mb-2">Current Settings</h2>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    Resolution: {settings.width}x{settings.height}
                  </li>
                  <li>Frame Rate: {settings.frameRate?.toFixed(1)} fps</li>
                  <li>
                    Aspect Ratio:{" "}
                    {settings.width && settings.height
                      ? (settings.width / settings.height).toFixed(2)
                      : "-"}
                  </li>
                  {settings.facingMode && (
                    <li>Facing: {settings.facingMode}</li>
                  )}
                </ul>
              </div>
              <div>
                <h2 className="font-bold mb-2">Capabilities</h2>
                <ul className="space-y-1 text-gray-600">
                  {capabilities && (
                    <>
                      <li>
                        Max Resolution: {capabilities.width?.max}x
                        {capabilities.height?.max}
                      </li>
                      <li>
                        Max Frame Rate:{" "}
                        {capabilities.frameRate?.max?.toFixed(1)} fps
                      </li>
                      {capabilities.facingMode && (
                        <li>Modes: {capabilities.facingMode.join(", ")}</li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-mono text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebcamDiagnostics;
