"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Cpu,
  Globe,
  Network,
  Radio,
  Share2,
  Laptop,
  Database,
  Package,
  Eye,
} from "lucide-react";

interface WebGLInfo {
  vendor: string;
  renderer: string;
  version: string;
}

interface BrowserDataType {
  network?: {
    online: boolean;
    connection?:
      | {
          type: string;
          downlink?: number | string;
          rtt?: number | string;
          saveData?: boolean;
        }
      | string;
  };
  fingerprint?: {
    canvas: string;
    webGL: WebGLInfo | string;
    audio: boolean;
  };
  system?: {
    platform: string;
    cores: number;
    memory?: number | string;
    maxTouch: number;
    plugins: Array<{
      name: string;
      description: string;
    }>;
  };
  storage?: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    cookiesEnabled: boolean;
    quota: string;
  };
  media?:
    | {
        videoFormats: string;
        audioFormats: string;
        mimeTypes: Array<{
          type: string;
          description: string;
        }>;
      }
    | Record<string, string>;
  features?: {
    webGL2: boolean;
    webVR: boolean;
    webXR: boolean;
    bluetooth: boolean;
    usb: boolean;
  };
  extensions?: {
    adBlocker: boolean | string;
    passwordManager: string;
  };
  browserInformation?: Record<string, string>;
  systemCapabilities?: Record<string, string>;
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
    pixelDepth: number;
    availWidth: number;
    availHeight: number;
    orientation?: string;
    scaling: number;
  };
  performance?:
    | {
        jsHeapSizeLimit: string;
        totalJSHeapSize: string;
        usedJSHeapSize: string;
      }
    | string;
  memory?:
    | {
        deviceMemory: string;
      }
    | string;
  permissionsSecurity?: Record<string, string>;
}

const BrowserDataInspector = () => {
  const [data, setData] = useState<BrowserDataType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [webRTCIPs, setWebRTCIPs] = useState<string[]>([]);

  useEffect(() => {
    const gatherData = async () => {
      setIsLoading(true);
      let ipData: { ip?: string } = {};
      let firstData: Partial<BrowserDataType> = {};

      try {
        // Get public IP
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        ipData = await ipResponse.json();

        // WebRTC IP detection
        const pc = new RTCPeerConnection();
        pc.createDataChannel("");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        pc.onicecandidate = (ice) => {
          if (ice.candidate) {
            const matches = ice.candidate.candidate.match(
              /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/g
            );
            if (matches) {
              setWebRTCIPs((prev) =>
                Array.from(new Set([...prev, ...matches]))
              );
            }
          }
        };

        // Storage quota
        const quotaData =
          "storage" in navigator && navigator.storage.estimate
            ? `${Math.round(
                (await navigator.storage.estimate()).quota! / 1024 / 1024
              )} MB`
            : "Not Available";

        // Video formats support
        const videoFormatsData =
          "mediaCapabilities" in navigator
            ? await (async () => {
                const formats = ["H264", "VP8", "VP9", "AV1"];
                const results = await Promise.all(
                  formats.map(async (format) => {
                    const info = await (navigator as any).mediaCapabilities
                      .decodingInfo({
                        type: "file",
                        video: {
                          contentType: `video/${format.toLowerCase()}`,
                          width: 1920,
                          height: 1080,
                          bitrate: 2000000,
                          framerate: 30,
                        },
                      })
                      .catch(() => ({ supported: false }));
                    return { format, supported: info.supported };
                  })
                );
                return (
                  results
                    .filter((r) => r.supported)
                    .map((r) => r.format)
                    .join(", ") || "Not Available"
                );
              })()
            : "Not Available";

        // Audio formats support
        const audioFormatsData =
          "mediaCapabilities" in navigator
            ? await (async () => {
                const formats = ["AAC", "MP3", "OPUS"];
                const results = await Promise.all(
                  formats.map(async (format) => {
                    const info = await (navigator as any).mediaCapabilities
                      .decodingInfo({
                        type: "file",
                        audio: {
                          contentType: `audio/${format.toLowerCase()}`,
                          channels: 2,
                          bitrate: 132000,
                          samplerate: 44100,
                        },
                      })
                      .catch(() => ({ supported: false }));
                    return { format, supported: info.supported };
                  })
                );
                return (
                  results
                    .filter((r) => r.supported)
                    .map((r) => r.format)
                    .join(", ") || "Not Available"
                );
              })()
            : "Not Available";

        // Canvas fingerprint
        const getCanvasFingerprint = (): string => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return "Not Available";
            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Hello, world!", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Hello, world!", 4, 17);
            return canvas.toDataURL().slice(-32);
          } catch (e) {
            return "Blocked";
          }
        };
        const canvasFingerprint = getCanvasFingerprint();

        // WebGL info
        const getWebGLInfo = (): WebGLInfo | string => {
          try {
            const canvas = document.createElement("canvas");
            const gl =
              canvas.getContext("webgl") ||
              canvas.getContext("experimental-webgl");
            if (!gl) return "Not Available";
            return {
              vendor: (gl as WebGLRenderingContext).getParameter(
                (gl as WebGLRenderingContext).VENDOR
              ),
              renderer: (gl as WebGLRenderingContext).getParameter(
                (gl as WebGLRenderingContext).RENDERER
              ),
              version: (gl as WebGLRenderingContext).getParameter(
                (gl as WebGLRenderingContext).VERSION
              ),
            };
          } catch (e) {
            return "Not Available";
          }
        };
        const webGLInfo = getWebGLInfo();

        // Ad Blocker detection
        const checkForAdBlocker = (): boolean | string => {
          try {
            const testAd = document.createElement("div");
            testAd.innerHTML = "&nbsp;";
            testAd.className = "adsbox";
            document.body.appendChild(testAd);
            const isAdBlocked = testAd.offsetHeight === 0;
            document.body.removeChild(testAd);
            return isAdBlocked;
          } catch (e) {
            return "Unable to detect";
          }
        };
        const adBlockerDetected = checkForAdBlocker();

        // Password Manager detection (basic check)
        const detectPasswordManager = (): string =>
          document.querySelector('input[autocomplete="current-password"]')
            ? "Detected"
            : "Not Detected";
        const passwordManagerStatus = detectPasswordManager();

        firstData = {
          network: {
            online: navigator.onLine,
            connection:
              "connection" in navigator
                ? {
                    type: (navigator as any).connection?.type || "unknown",
                    downlink:
                      (navigator as any).connection?.downlink ||
                      "Not Available",
                    rtt: (navigator as any).connection?.rtt || "Not Available",
                    saveData: (navigator as any).connection?.saveData || false,
                  }
                : "Not Available",
          },
          fingerprint: {
            canvas: canvasFingerprint,
            webGL: webGLInfo,
            audio: "AudioContext" in window,
          },
          system: {
            platform: navigator.platform,
            cores: navigator.hardwareConcurrency,
            memory: (navigator as any).deviceMemory || "Not Available",
            maxTouch: navigator.maxTouchPoints,
            plugins: Array.from(navigator.plugins).map((p) => ({
              name: p.name,
              description: p.description,
            })),
          },
          storage: {
            localStorage: typeof localStorage !== "undefined",
            sessionStorage: typeof sessionStorage !== "undefined",
            indexedDB: typeof indexedDB !== "undefined",
            cookiesEnabled: navigator.cookieEnabled,
            quota: quotaData,
          },
          media: {
            videoFormats: videoFormatsData,
            audioFormats: audioFormatsData,
            mimeTypes: Array.from(navigator.mimeTypes).map((m) => ({
              type: m.type,
              description: m.description,
            })),
          },
          features: {
            webGL2: typeof WebGL2RenderingContext === "function",
            webVR: "getVRDisplays" in navigator,
            webXR: "xr" in navigator,
            bluetooth: "bluetooth" in navigator,
            usb: "usb" in navigator,
          },
          extensions: {
            adBlocker: adBlockerDetected,
            passwordManager: passwordManagerStatus,
          },
        };
      } catch (error) {
        console.error("Error gathering data", error);
      }

      // Second block data
      const screenData = {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        orientation: window.screen.orientation?.type || "Not Available",
        scaling: window.devicePixelRatio,
      };

      const connectionData =
        "connection" in navigator
          ? {
              type: (navigator as any).connection?.effectiveType || "unknown",
              downlink:
                (navigator as any).connection?.downlink || "Not Available",
              rtt: (navigator as any).connection?.rtt || "Not Available",
              saveData: (navigator as any).connection?.saveData || false,
            }
          : "Not Available";

      const performanceData = (performance as any).memory
        ? {
            jsHeapSizeLimit:
              ((performance as any).memory.jsHeapSizeLimit / 1048576).toFixed(
                2
              ) + " MB",
            totalJSHeapSize:
              ((performance as any).memory.totalJSHeapSize / 1048576).toFixed(
                2
              ) + " MB",
            usedJSHeapSize:
              ((performance as any).memory.usedJSHeapSize / 1048576).toFixed(
                2
              ) + " MB",
          }
        : "Not Available";

      const memoryData = (navigator as any).deviceMemory
        ? { deviceMemory: (navigator as any).deviceMemory + " GB" }
        : "Not Available";

      const browserInformation = {
        "User Agent": navigator.userAgent,
        "Browser Language": navigator.language,
        Languages: navigator.languages.join(", "),
        "Cookies Enabled": String(navigator.cookieEnabled),
        "Do Not Track": navigator.doNotTrack,
        Platform: navigator.platform,
        Vendor: navigator.vendor,
        Product: navigator.product,
        "Online Status": navigator.onLine ? "Online" : "Offline",
      };

      const systemCapabilities = {
        "Max Touch Points": String(navigator.maxTouchPoints),
        "Hardware Concurrency": String(navigator.hardwareConcurrency),
        "Device Memory": (navigator as any).deviceMemory
          ? `${(navigator as any).deviceMemory} GB`
          : "Not Available",
        "PDF Viewer Built-in": (navigator as any).pdfViewerEnabled
          ? "Yes"
          : "No",
        "Java Enabled": (navigator as any).javaEnabled
          ? String((navigator as any).javaEnabled())
          : "Not Available",
      };

      const permissionsSecurity = {
        Cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
        JavaScript: "Enabled",
        "Protected Media":
          "mediaCapabilities" in navigator ? "Available" : "Not Available",
        Geolocation: "geolocation" in navigator ? "Available" : "Not Available",
        Notifications: "Notification" in window ? "Available" : "Not Available",
        Camera: "mediaDevices" in navigator ? "Available" : "Not Available",
        Microphone: "mediaDevices" in navigator ? "Available" : "Not Available",
      };

      const mediaCapabilities = {
        Audio: "AudioContext" in window ? "Supported" : "Not Supported",
        WebRTC: "RTCPeerConnection" in window ? "Supported" : "Not Supported",
        "Speech Recognition":
          "SpeechRecognition" in window || "webkitSpeechRecognition" in window
            ? "Supported"
            : "Not Supported",
        "Speech Synthesis":
          "speechSynthesis" in window ? "Supported" : "Not Supported",
        WebGL:
          "WebGLRenderingContext" in window ? "Supported" : "Not Supported",
        "Video Formats":
          (firstData.media as any)?.videoFormats || "Not Available",
        "Audio Formats":
          (firstData.media as any)?.audioFormats || "Not Available",
      };

      const combinedNetwork = {
        "Public IP": ipData?.ip || "Loading...",
        "Connection Type":
          connectionData && typeof connectionData !== "string"
            ? connectionData.type
            : "Not Available",
        "Download Speed":
          connectionData && typeof connectionData !== "string"
            ? `${connectionData.downlink} Mbps`
            : "Unknown",
        Latency:
          connectionData && typeof connectionData !== "string"
            ? `${connectionData.rtt} ms`
            : "Unknown",
        "Online Status": (firstData.network as any)?.online
          ? "Online"
          : "Offline",
      };

      const combinedData: BrowserDataType = {
        browserInformation,
        systemCapabilities,
        screen: screenData,
        network: combinedNetwork,
        performance: performanceData as any,
        memory: memoryData as any,
        fingerprint: firstData.fingerprint,
        storage: firstData.storage,
        media: mediaCapabilities,
        features: firstData.features,
        extensions: firstData.extensions,
        system: firstData.system,
        permissionsSecurity,
      };

      setData(combinedData);
      setIsLoading(false);
    };

    gatherData();

    const gatherScreenData = () => {
      setData((prev) => ({
        ...prev,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          orientation: window.screen.orientation?.type || "Not Available",
          scaling: window.devicePixelRatio,
        },
      }));
    };

    window.addEventListener("resize", gatherScreenData);
    return () => window.removeEventListener("resize", gatherScreenData);
  }, []);

  // Define sections for display
  const sections = [
    {
      title: "Browser Information",
      icon: <Globe className="w-5 h-5" />,
      data: data.browserInformation || {},
    },
    {
      title: "System Capabilities",
      icon: <Cpu className="w-5 h-5" />,
      data: data.systemCapabilities || {},
    },
    {
      title: "Screen & Display",
      icon: <Laptop className="w-5 h-5" />,
      data: {
        Resolution: data.screen
          ? `${data.screen.width}x${data.screen.height}`
          : "Not Available",
        "Available Resolution": data.screen
          ? `${data.screen.availWidth}x${data.screen.availHeight}`
          : "Not Available",
        "Color Depth": data.screen?.colorDepth
          ? `${data.screen.colorDepth} bits`
          : "Not Available",
        "Pixel Depth": data.screen?.pixelDepth
          ? `${data.screen.pixelDepth} bits`
          : "Not Available",
        "Device Pixel Ratio": data.screen?.scaling,
        Orientation: data.screen?.orientation,
      },
    },
    {
      title: "Network & Connection",
      icon: <Network className="w-5 h-5" />,
      data: {
        "Public IP": data.network?.["Public IP"] || "Loading...",
        "WebRTC IPs": webRTCIPs.join(", ") || "None detected",
        "Connection Type": data.network?.["Connection Type"] || "Not Available",
        "Download Speed": data.network?.["Download Speed"] || "Unknown",
        Latency: data.network?.["Latency"] || "Unknown",
        "Online Status": data.network?.["Online Status"] || "Offline",
      },
    },
    {
      title: "Performance & Memory",
      icon: <Cpu className="w-5 h-5" />,
      data: {
        "JS Heap Size Limit":
          (typeof data.performance === "object" &&
            data.performance?.jsHeapSizeLimit) ||
          "Not Available",
        "Total JS Heap Size":
          (typeof data.performance === "object" &&
            data.performance?.totalJSHeapSize) ||
          "Not Available",
        "Used JS Heap Size":
          (typeof data.performance === "object" &&
            data.performance?.usedJSHeapSize) ||
          "Not Available",
        "Device Memory":
          (typeof data.memory === "object" && data.memory?.deviceMemory) ||
          "Not Available",
      },
    },
    {
      title: "Permissions & Security",
      icon: <Share2 className="w-5 h-5" />,
      data: data.permissionsSecurity || {},
    },
    {
      title: "Media Capabilities",
      icon: <Radio className="w-5 h-5" />,
      data: data.media || {},
    },
    {
      title: "Browser Fingerprint",
      icon: <Eye className="w-5 h-5" />,
      data: {
        "Canvas Hash": data.fingerprint?.canvas || "Not Available",
        "WebGL Vendor":
          typeof data.fingerprint?.webGL === "object"
            ? data.fingerprint?.webGL.vendor
            : "Not Available",
        "WebGL Renderer":
          typeof data.fingerprint?.webGL === "object"
            ? data.fingerprint?.webGL.renderer
            : "Not Available",
        "Audio Context": data.fingerprint?.audio
          ? "Available"
          : "Not Available",
      },
    },
    {
      title: "Storage",
      icon: <Database className="w-5 h-5" />,
      data: {
        "Local Storage": data.storage?.localStorage
          ? "Available"
          : "Not Available",
        "Session Storage": data.storage?.sessionStorage
          ? "Available"
          : "Not Available",
        IndexedDB: data.storage?.indexedDB ? "Available" : "Not Available",
        "Cookies Enabled": data.storage?.cookiesEnabled
          ? "Enabled"
          : "Disabled",
        Quota: data.storage?.quota || "Not Available",
      },
    },
    {
      title: "Extensions & Add-ons",
      icon: <Package className="w-5 h-5" />,
      data: {
        "Ad Blocker":
          data.extensions?.adBlocker === true ? "Detected" : "Not Detected",
        "Password Manager": data.extensions?.passwordManager,
        Plugins: data.system?.plugins
          ? data.system.plugins.map((p) => p.name).join(", ")
          : "None",
      },
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        <div className="relative border border-gray-300 p-6 rounded-lg">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Browser Data Inspector
          </h1>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="mb-2">
                This page combines extensive data available to
                webpages—including browser info, system capabilities, network
                details, and more.
              </p>
              <p>
                <strong>Note:</strong> Some data may be blocked or unavailable
                due to privacy settings or browser restrictions.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center p-8 text-gray-500">
              Gathering browser data...
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    {section.icon}
                    <h2 className="font-mono font-bold">{section.title}</h2>
                  </div>
                  <div className="p-4">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(section.data).map(([key, value]) => (
                        <div key={key} className="font-mono text-sm">
                          <dt className="text-gray-600">{key}</dt>
                          <dd className="mt-1 text-gray-900 break-all">
                            {value?.toString() || "Not Available"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserDataInspector;
