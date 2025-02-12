"use client";

import React, { useState, useEffect, useRef } from "react";

const SpeakerTest = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const oscillatorRef = useRef<Record<string, OscillatorNode>>({});

  // Test configurations
  const tests = {
    subBass: { freq: 20, name: "Sub Bass Test (20Hz)" },
    bass: { freq: 60, name: "Bass Test (60Hz)" },
    midRange: { freq: 1000, name: "Mid Range (1kHz)" },
    highRange: { freq: 10000, name: "High Range (10kHz)" },
    sweepLow: { start: 20, end: 200, name: "Bass Sweep" },
    sweepHigh: { start: 200, end: 20000, name: "Full Range Sweep" },
  };

  useEffect(() => {
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  const startTone = (frequency: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Soft start
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);

    oscillator.start();
    return { oscillator, gainNode };
  };

  const startSweep = (startFreq: number, endFreq: number) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      endFreq,
      audioContext.currentTime + 5
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);

    oscillator.start();
    return { oscillator, gainNode };
  };

  const handlePlay = (testKey: string) => {
    if (!audioContext) return;

    if (isPlaying[testKey]) {
      if (oscillatorRef.current[testKey]) {
        oscillatorRef.current[testKey].stop();
        delete oscillatorRef.current[testKey];
      }
      setIsPlaying((prev) => ({ ...prev, [testKey]: false }));
    } else {
      const test = tests[testKey as keyof typeof tests];
      let nodes;

      if ("freq" in test) {
        nodes = startTone(test.freq);
      } else {
        nodes = startSweep(test.start, test.end);
      }

      if (nodes) {
        oscillatorRef.current[testKey] = nodes.oscillator;
        setIsPlaying((prev) => ({ ...prev, [testKey]: true }));

        if ("end" in test) {
          // Stop sweep after 5 seconds
          setTimeout(() => {
            nodes?.oscillator.stop();
            delete oscillatorRef.current[testKey];
            setIsPlaying((prev) => ({ ...prev, [testKey]: false }));
          }, 5000);
        }
      }
    }
  };

  const stopAll = () => {
    Object.keys(oscillatorRef.current).forEach((key) => {
      oscillatorRef.current[key].stop();
      delete oscillatorRef.current[key];
    });
    setIsPlaying({});
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="relative border border-gray-300 p-6 rounded-lg">
          <h1 className="absolute -top-3 left-4 bg-white px-2 text-lg font-mono">
            Speaker Test
          </h1>

          <div className="space-y-4">
            {Object.entries(tests).map(([key, test]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-md"
              >
                <span className="font-mono text-sm">{test.name}</span>
                <button
                  onClick={() => handlePlay(key)}
                  className={`font-mono text-sm px-4 py-2 rounded-md transition-colors
                    ${
                      isPlaying[key]
                        ? "bg-blue-100 border-blue-400 border"
                        : "bg-white hover:bg-gray-50 border border-gray-300"
                    }`}
                >
                  {isPlaying[key] ? "Stop" : "Play"}
                </button>
              </div>
            ))}

            <div className="mt-6 text-center">
              <button
                onClick={stopAll}
                className="font-mono text-sm text-red-500 px-6 py-2 bg-red-50 hover:bg-red-100 
                  border border-red-200 rounded-md transition-colors"
              >
                Stop All Tests
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="font-mono text-sm text-gray-500">
              Use headphones for best results. Start with low volume.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerTest;
