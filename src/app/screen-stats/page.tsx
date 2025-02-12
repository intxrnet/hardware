"use client";

import React, { useState, useEffect } from "react";
import { Laptop } from "lucide-react";

const ScreenStats = () => {
  const [screenData, setScreenData] = useState({
    width: 0,
    height: 0,
    availWidth: 0,
    availHeight: 0,
    colorDepth: 0,
    pixelDepth: 0,
    orientation: "Not Available",
    scaling: 1,
  });

  // Function to gather screen information
  const getScreenData = () => {
    setScreenData({
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      orientation: window.screen.orientation
        ? window.screen.orientation.type
        : "Not Available",
      scaling: window.devicePixelRatio,
    });
  };

  useEffect(() => {
    getScreenData();

    window.addEventListener("resize", getScreenData);
    return () => window.removeEventListener("resize", getScreenData);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="relative border border-gray-300 p-6 rounded-lg">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Screen Stats
          </h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <Laptop className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              This component displays all available information about your
              screen.
            </p>
          </div>

          <div className="p-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
              <div>
                <dt className="text-gray-600">Screen Resolution</dt>
                <dd className="mt-1 text-gray-900">
                  {screenData.width} x {screenData.height}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Available Resolution</dt>
                <dd className="mt-1 text-gray-900">
                  {screenData.availWidth} x {screenData.availHeight}
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Color Depth</dt>
                <dd className="mt-1 text-gray-900">
                  {screenData.colorDepth} bits
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Pixel Depth</dt>
                <dd className="mt-1 text-gray-900">
                  {screenData.pixelDepth} bits
                </dd>
              </div>
              <div>
                <dt className="text-gray-600">Device Pixel Ratio</dt>
                <dd className="mt-1 text-gray-900">{screenData.scaling}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Orientation</dt>
                <dd className="mt-1 text-gray-900">{screenData.orientation}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenStats;
