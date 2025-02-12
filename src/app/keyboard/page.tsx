"use client";

import React, { useState, useEffect } from "react";

const KeyboardTest = () => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const keyboardLayout = [
    [
      ["Escape", "Esc"],
      ["F1"],
      ["F2"],
      ["F3"],
      ["F4"],
      ["F5"],
      ["F6"],
      ["F7"],
      ["F8"],
      ["F9"],
      ["F10"],
      ["F11"],
      ["F12"],
    ],
    [
      ["`", "~"],
      ["1", "!"],
      ["2", "@"],
      ["3", "#"],
      ["4", "$"],
      ["5", "%"],
      ["6", "^"],
      ["7", "&"],
      ["8", "*"],
      ["9", "("],
      ["0", ")"],
      ["-", "_"],
      ["=", "+"],
      ["Backspace", "⌫"],
    ],
    [
      ["Tab", "⇥"],
      ["q", "Q"],
      ["w", "W"],
      ["e", "E"],
      ["r", "R"],
      ["t", "T"],
      ["y", "Y"],
      ["u", "U"],
      ["i", "I"],
      ["o", "O"],
      ["p", "P"],
      ["[", "{"],
      ["]", "}"],
      ["\\", "|"],
    ],
    [
      ["CapsLock", "⇪"],
      ["a", "A"],
      ["s", "S"],
      ["d", "D"],
      ["f", "F"],
      ["g", "G"],
      ["h", "H"],
      ["j", "J"],
      ["k", "K"],
      ["l", "L"],
      [";", ":"],
      ["'", '"'],
      ["Enter", "⏎"],
    ],
    [
      ["Shift", "⇧"],
      ["z", "Z"],
      ["x", "X"],
      ["c", "C"],
      ["v", "V"],
      ["b", "B"],
      ["n", "N"],
      ["m", "M"],
      [",", "<"],
      [".", ">"],
      ["/", "?"],
      ["Shift", "⇧"],
    ],
    [
      ["Control", "Ctrl"],
      ["Meta", "⌘"],
      ["Alt", "⌥"],
      ["Space", " "],
      ["Alt", "⌥"],
      ["Meta", "⌘"],
      ["Control", "Ctrl"],
    ],
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setPressedKeys((prev) => new Set(prev).add(e.key));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(e.key);
        return newSet;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const getKeyClass = (key: string[]) => {
    const isPressed = pressedKeys.has(key[0]) || pressedKeys.has(key[1]);
    let baseClass =
      "font-mono text-sm border border-gray-300 rounded-md flex items-center justify-center transition-colors";

    // Special width classes for specific keys
    if (["Backspace", "Enter", "Shift", "CapsLock"].includes(key[0])) {
      baseClass += " w-20";
    } else if (key[0] === "Space") {
      baseClass += " w-64";
    } else if (["Control", "Meta", "Alt"].includes(key[0])) {
      baseClass += " w-16";
    } else if (key[0] === "Tab") {
      baseClass += " w-16";
    } else {
      baseClass += " w-12";
    }

    // Height class
    baseClass += " h-12";

    // Pressed state
    if (isPressed) {
      baseClass += " bg-blue-100 border-blue-400";
    } else {
      baseClass += " bg-white hover:bg-gray-50";
    }

    return baseClass;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="relative border border-gray-300 p-6 rounded-lg mb-8">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Keyboard Test
          </h1>

          <div className="space-y-2">
            {keyboardLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 justify-center">
                {row.map((key, keyIndex) => (
                  <div key={keyIndex} className={getKeyClass(key)}>
                    {key[1] || key[0]}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="font-mono text-sm text-gray-500">
              Press any key to test
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardTest;
