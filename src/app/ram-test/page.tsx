"use client";

import React, { useState, useEffect } from "react";
import { Cpu } from "lucide-react";

const RAMTest = () => {
  // State for memory stats (from performance.memory if available)
  const [memoryStats, setMemoryStats] = useState({
    jsHeapSizeLimit: 0,
    totalJSHeapSize: 0,
    usedJSHeapSize: 0,
  });
  const [deviceMemory, setDeviceMemory] = useState<number | null>(null);
  const [tabsCount, setTabsCount] = useState<number>(1);

  // Generate a unique ID for this tab
  const [tabId] = useState(
    () => Date.now() + "-" + Math.random().toString(36).substring(2, 15)
  );

  // Update memory stats using performance.memory (Chrome only)
  const updateMemoryStats = () => {
    if ((performance as any).memory) {
      const { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize } = (
        performance as any
      ).memory;
      setMemoryStats({ jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize });
    }
  };

  // Update device memory (if available)
  useEffect(() => {
    if ((navigator as any).deviceMemory) {
      setDeviceMemory((navigator as any).deviceMemory);
    }
  }, []);

  // Update memory stats every second (if available)
  useEffect(() => {
    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Use localStorage to track open tabs across the same origin.
  const storageKey = "ramTest_openTabs";

  // Update the open tabs count from localStorage
  const updateTabsCount = () => {
    const tabs = localStorage.getItem(storageKey);
    if (tabs) {
      try {
        const tabsArray: string[] = JSON.parse(tabs);
        setTabsCount(tabsArray.length);
      } catch (e) {
        setTabsCount(1);
      }
    } else {
      setTabsCount(1);
    }
  };

  // On mount, add our tabId into localStorage
  useEffect(() => {
    const addTab = () => {
      const tabs = localStorage.getItem(storageKey);
      let tabsArray: string[] = [];
      if (tabs) {
        try {
          tabsArray = JSON.parse(tabs);
        } catch (e) {
          tabsArray = [];
        }
      }
      if (!tabsArray.includes(tabId)) {
        tabsArray.push(tabId);
      }
      localStorage.setItem(storageKey, JSON.stringify(tabsArray));
      updateTabsCount();
    };

    const removeTab = () => {
      const tabs = localStorage.getItem(storageKey);
      let tabsArray: string[] = [];
      if (tabs) {
        try {
          tabsArray = JSON.parse(tabs);
        } catch (e) {
          tabsArray = [];
        }
      }
      const newTabs = tabsArray.filter((id) => id !== tabId);
      localStorage.setItem(storageKey, JSON.stringify(newTabs));
      updateTabsCount();
    };

    addTab();
    window.addEventListener("storage", updateTabsCount);
    window.addEventListener("beforeunload", removeTab);

    return () => {
      removeTab();
      window.removeEventListener("storage", updateTabsCount);
      window.removeEventListener("beforeunload", removeTab);
    };
  }, [tabId]);

  // Compute tab efficiency as the ratio of used JS heap to the JS heap size limit.
  const tabEfficiency =
    memoryStats.jsHeapSizeLimit > 0
      ? (memoryStats.usedJSHeapSize / memoryStats.jsHeapSizeLimit) * 100
      : 0;

  // Helper to format bytes to MB.
  const formatBytes = (bytes: number) =>
    (bytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="relative border border-gray-300 p-6 rounded-lg">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            RAM Test
          </h1>

          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Cpu className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              This test displays approximate memory usage for your current tab,
              your device’s memory, and how many tabs are open. Note that memory
              stats (JS heap info) are only available in some browsers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <dt className="text-gray-600">Device Memory</dt>
              <dd className="mt-1 text-gray-900">
                {deviceMemory ? deviceMemory + " GB" : "Not Available"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Open Tabs</dt>
              <dd className="mt-1 text-gray-900">{tabsCount}</dd>
            </div>
            <div>
              <dt className="text-gray-600">JS Heap Size Limit</dt>
              <dd className="mt-1 text-gray-900">
                {(performance as any).memory
                  ? formatBytes(memoryStats.jsHeapSizeLimit)
                  : "Not Available"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Total JS Heap Size</dt>
              <dd className="mt-1 text-gray-900">
                {(performance as any).memory
                  ? formatBytes(memoryStats.totalJSHeapSize)
                  : "Not Available"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Used JS Heap Size</dt>
              <dd className="mt-1 text-gray-900">
                {(performance as any).memory
                  ? formatBytes(memoryStats.usedJSHeapSize)
                  : "Not Available"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600">Tab Efficiency</dt>
              <dd className="mt-1 text-gray-900">
                {(performance as any).memory
                  ? tabEfficiency.toFixed(2) + " %"
                  : "Not Available"}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAMTest;
