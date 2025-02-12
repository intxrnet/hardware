"use client";

import React, { useState } from "react";

// A small triangle marker component
const TriangleMarker = ({ label, pos }: { label: string; pos: string }) => (
  <div
    className="absolute flex flex-col items-center"
    style={{ left: pos, transform: "translateX(-50%)" }}
  >
    {/* Triangle shape */}
    <div
      className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-6"
      style={{ borderBottomColor: "#ffffff" }}
    />
    <span className="text-xs text-white mt-1">{label}</span>
  </div>
);

const GamutTest = () => {
  // Toggle between "sideBySide" and "spectrum" views.
  const [view, setView] = useState<"sideBySide" | "spectrum">("sideBySide");

  const colorSpaces = [
    { name: "sRGB", description: "Standard RGB color space" },
    { name: "AdobeRGB", description: "Adobe RGB (1998) color space" },
    { name: "P3", description: "Display P3 color space" },
    { name: "Rec.2020", description: "ITU-R BT.2020 color space" },
    { name: "ProPhoto", description: "ProPhoto RGB color space" },
    { name: "XYZ D50", description: "CIE XYZ D50 color space" },
    { name: "XYZ D65", description: "CIE XYZ D65 color space" },
    { name: "Lab", description: "CIE Lab color space" },
    { name: "LCH", description: "CIE LCH color space" },
    { name: "HSL", description: "HSL color space" },
    { name: "HSV", description: "HSV color space" },
  ];

  // Returns a color value for a given color space and primary ("red", "green", "blue").
  const generateColorValue = (space: string, color: string) => {
    const values = {
      red: color === "red" ? 1 : 0,
      green: color === "green" ? 1 : 0,
      blue: color === "blue" ? 1 : 0,
    };

    switch (space) {
      case "sRGB":
        return `rgb(${values.red * 255}, ${values.green * 255}, ${
          values.blue * 255
        })`;
      case "P3":
        return `color(display-p3 ${values.red} ${values.green} ${values.blue})`;
      case "Rec.2020":
        return `color(rec2020 ${values.red} ${values.green} ${values.blue})`;
      case "Lab":
        return `lab(${values.red * 100}% ${values.green * 125} ${
          values.blue * 125
        })`;
      case "LCH":
        return `lch(${values.red * 100}% ${values.green * 125} ${
          values.blue * 360
        })`;
      case "HSL":
        return `hsl(${values.red * 360}, ${values.green * 100}%, ${
          values.blue * 100
        }%)`;
      case "HSV":
        // HSV converted to HSL for browser compatibility
        return `hsl(${values.red * 360}, ${values.green * 100}%, ${
          values.blue * 50
        }%)`;
      default:
        return `rgb(${values.red * 255}, ${values.green * 255}, ${
          values.blue * 255
        })`;
    }
  };

  // Define sample gradients for each color space for the spectrum view.
  const gamutGradients: { [key: string]: string } = {
    sRGB: "linear-gradient(to right, red, yellow, green, cyan, blue, magenta, red)",
    AdobeRGB:
      "linear-gradient(to right, red, orange, yellow, green, cyan, blue, magenta, red)",
    P3: "linear-gradient(to right, red, orange, yellow, green, blue)",
    "Rec.2020": "linear-gradient(to right, red, yellow, green, blue)",
    ProPhoto:
      "linear-gradient(to right, red, orange, yellow, green, blue, magenta)",
    "XYZ D50": "linear-gradient(to right, red, yellow, green, blue)",
    "XYZ D65": "linear-gradient(to right, red, yellow, green, blue)",
    Lab: "linear-gradient(to right, red, yellow, green, blue)",
    LCH: "linear-gradient(to right, red, yellow, green, blue)",
    HSL: "linear-gradient(to right, red, yellow, green, blue)",
    HSV: "linear-gradient(to right, red, yellow, green, blue)",
  };

  // Define marker positions for each color space (customize as needed)
  const gamutMarkers: {
    [key: string]: { label: string; pos: string }[];
  } = {
    sRGB: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    AdobeRGB: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "45%" },
      { label: "B", pos: "100%" },
    ],
    P3: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "55%" },
      { label: "B", pos: "100%" },
    ],
    "Rec.2020": [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    ProPhoto: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    "XYZ D50": [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    "XYZ D65": [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    Lab: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    LCH: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    HSL: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
    HSV: [
      { label: "R", pos: "0%" },
      { label: "G", pos: "50%" },
      { label: "B", pos: "100%" },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        <div className="relative border border-gray-300 p-6 rounded-lg mb-8">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Color Gamuts
          </h1>

          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded font-mono ${
                view === "sideBySide"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
              onClick={() => setView("sideBySide")}
            >
              Triads
            </button>
            <button
              className={`px-4 py-2 rounded font-mono ${
                view === "spectrum"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
              onClick={() => setView("spectrum")}
            >
              Spectrum
            </button>
          </div>

          {view === "sideBySide" ? (
            // Variation 1: Side-by-Side Comparison
            <div className="flex flex-row gap-4">
              {/* Names Column */}
              <div className="w-1/4 space-y-6">
                {colorSpaces.map((space, index) => (
                  <div key={index} className="group relative">
                    <p className="font-mono text-sm whitespace-nowrap">
                      {space.name}
                    </p>
                    <div className="hidden group-hover:block absolute top-full mt-2 left-0 p-2 bg-white border border-gray-200 rounded shadow-lg z-10">
                      <p className="font-mono text-sm">{space.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Columns for Red, Green, Blue */}
              {["red", "green", "blue"].map((color) => (
                <div key={color} className="w-1/4 space-y-6">
                  {colorSpaces.map((space, index) => (
                    <div
                      key={index}
                      className="h-16 rounded-lg"
                      style={{
                        backgroundColor: generateColorValue(space.name, color),
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Variation 2: Spectrum View with Triangle Markers
            <div className="space-y-8">
              {colorSpaces.map((space, index) => {
                const gradient =
                  gamutGradients[space.name] || gamutGradients["sRGB"];
                const markers =
                  gamutMarkers[space.name] || gamutMarkers["sRGB"];
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold">
                        {space.name}
                      </p>
                      <p className="font-mono text-xs text-gray-600">
                        {space.description}
                      </p>
                    </div>
                    <div className="relative h-16 rounded-lg overflow-hidden">
                      <div
                        className="h-full w-full"
                        style={{ background: gradient }}
                      ></div>
                      {/* Render markers */}
                      {markers.map((m, i) => (
                        <TriangleMarker key={i} label={m.label} pos={m.pos} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamutTest;
