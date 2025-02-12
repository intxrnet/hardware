"use client";

import { useState, useEffect, useCallback } from "react";

export default function MouseTestPage() {
  const [clickCount, setClickCount] = useState({
    left: 0,
    middle: 0,
    right: 0,
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lastEvent, setLastEvent] = useState<string>("");
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
  });
  const [wheelDelta, setWheelDelta] = useState({ deltaX: 0, deltaY: 0 });
  const [doubleClickCount, setDoubleClickCount] = useState(0);

  const handleMouseClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const newClicks = { ...clickCount };
      if (e.button === 0) newClicks.left++;
      if (e.button === 1) newClicks.middle++;
      if (e.button === 2) newClicks.right++;
      setClickCount(newClicks);
      setLastEvent(`Mouse${e.type} (button: ${e.button})`);
    },
    [clickCount]
  );

  const handleReset = useCallback(() => {
    setClickCount({ left: 0, middle: 0, right: 0 });
    setLastEvent("Reset clicked");
    setDragState({ isDragging: false, startX: 0, startY: 0 });
    setWheelDelta({ deltaX: 0, deltaY: 0 });
    setDoubleClickCount(0);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: Math.round(e.clientX - rect.left),
        y: Math.round(e.clientY - rect.top),
      });
      setLastEvent("MouseMove");

      if (dragState.isDragging) {
        const dragDistance = Math.sqrt(
          Math.pow(e.clientX - dragState.startX, 2) +
            Math.pow(e.clientY - dragState.startY, 2)
        );
        setLastEvent(`Dragging (distance: ${dragDistance.toFixed(2)}px)`);
      }
    },
    [dragState]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setDragState({ isDragging: true, startX: e.clientX, startY: e.clientY });
      handleMouseClick(e);
    },
    [handleMouseClick]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setDragState({ isDragging: false, startX: 0, startY: 0 });
    setLastEvent(`MouseUp (button: ${e.button})`);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    setWheelDelta({ deltaX: e.deltaX, deltaY: e.deltaY });
    setLastEvent(`Wheel (deltaX: ${e.deltaX}, deltaY: ${e.deltaY})`);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setDoubleClickCount((prev) => prev + 1);
    setLastEvent("DoubleClick");
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setLastEvent(`Global MouseMove (${e.clientX}, ${e.clientY})`);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, []);

  return (
    <div className="p-8 space-y-6 flex flex-col items-center">
      <div
        className="relative border border-gray-300 rounded-lg p-6 w-full max-w-4xl"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="absolute -top-3 bg-white px-2 left-4 text-sm font-mono">
          Mouse Interaction Area
        </span>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-md text-center font-mono">
              Left: {clickCount.left}
            </div>
            <div className="p-4 border rounded-md text-center font-mono">
              Middle: {clickCount.middle}
            </div>
            <div className="p-4 border rounded-md text-center font-mono">
              Right: {clickCount.right}
            </div>
          </div>
          <div className="p-4 border rounded-md text-center font-mono">
            Double Clicks: {doubleClickCount}
          </div>
          <button
            onClick={handleReset}
            className="transition-colors rounded-md flex items-center justify-center bg-gray-100 hover:bg-gray-200 p-2 text-sm w-1/4 font-mono"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mouse Position Tracker */}
      <div className="relative border border-gray-300 rounded-lg p-6 w-full max-w-4xl">
        <span className="absolute -top-3 bg-white px-2 left-4 text-sm font-mono">
          Mouse Position
        </span>
        <div className="space-y-2 font-mono">
          <p>
            Relative: X: {mousePosition.x} | Y: {mousePosition.y}
          </p>
          <p>
            Screen: X: {Math.round(window?.screenX || 0)} | Y:{" "}
            {Math.round(window?.screenY || 0)}
          </p>
        </div>
      </div>

      {/* Mouse Events */}
      <div className="relative border border-gray-300 rounded-lg p-6 w-full max-w-4xl">
        <span className="absolute -top-3 bg-white px-2 left-4 text-sm font-mono">
          Last Event
        </span>
        <p className="font-mono">{lastEvent || "No events yet"}</p>
      </div>

      {/* Wheel Delta */}
      <div className="relative border border-gray-300 rounded-lg p-6 w-full max-w-4xl">
        <span className="absolute -top-3 bg-white px-2 left-4 text-sm font-mono">
          Wheel Delta
        </span>
        <div className="space-y-2 font-mono">
          <p>Delta X: {wheelDelta.deltaX}</p>
          <p>Delta Y: {wheelDelta.deltaY}</p>
        </div>
      </div>

      {/* Mouse Properties */}
      <div className="relative border border-gray-300 rounded-lg p-6 w-full max-w-4xl">
        <span className="absolute -top-3 bg-white px-2 left-4 text-sm font-mono">
          Mouse Properties
        </span>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <p className="font-mono">
              Buttons: {navigator?.maxTouchPoints || "Not available"}
            </p>
          </div>
          <div className="p-4 border rounded-md">
            <p className="font-mono">
              Touch Points: {navigator?.maxTouchPoints || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Cursor Types */}
      <div className="relative border border-gray-300 rounded-lg p-6 w-full max-w-4xl">
        <span className="absolute -top-3 bg-white px-2 left-4 text-sm font-mono">
          Cursor Types
        </span>
        <div className="grid grid-cols-4 gap-4">
          <div className="cursor-default p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            default
          </div>
          <div className="cursor-pointer p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            pointer
          </div>
          <div className="cursor-text p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            text
          </div>
          <div className="cursor-move p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            move
          </div>
          <div className="cursor-wait p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            wait
          </div>
          <div className="cursor-progress p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            progress
          </div>
          <div className="cursor-help p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            help
          </div>
          <div className="cursor-crosshair p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            crosshair
          </div>
          <div className="cursor-not-allowed p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            not-allowed
          </div>
          <div className="cursor-grab p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            grab
          </div>
          <div className="cursor-grabbing p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            grabbing
          </div>
          <div className="cursor-col-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            col-resize
          </div>
          <div className="cursor-row-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            row-resize
          </div>
          <div className="cursor-n-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            n-resize
          </div>
          <div className="cursor-e-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            e-resize
          </div>
          <div className="cursor-s-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            s-resize
          </div>
          <div className="cursor-w-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            w-resize
          </div>
          <div className="cursor-ne-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            ne-resize
          </div>
          <div className="cursor-nw-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            nw-resize
          </div>
          <div className="cursor-se-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            se-resize
          </div>
          <div className="cursor-sw-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            sw-resize
          </div>
          <div className="cursor-ew-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            ew-resize
          </div>
          <div className="cursor-ns-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            ns-resize
          </div>
          <div className="cursor-nesw-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            nesw-resize
          </div>
          <div className="cursor-nwse-resize p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            nwse-resize
          </div>
          <div className="cursor-zoom-in p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            zoom-in
          </div>
          <div className="cursor-zoom-out p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            zoom-out
          </div>
          <div className="cursor-cell p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            cell
          </div>
          <div className="cursor-copy p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            copy
          </div>
          <div className="cursor-alias p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            alias
          </div>
          <div className="cursor-context-menu p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            context-menu
          </div>
          <div className="cursor-all-scroll p-4 border rounded-md text-center font-mono hover:bg-gray-50">
            all-scroll
          </div>
        </div>
      </div>
    </div>
  );
}
