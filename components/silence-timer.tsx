"use client";

import { useEffect, useState } from "react";

const minuteOptions = [1, 5, 10, 20];
const defaultSeconds = 5 * 60;
const timerCompleteMessage = "Be still and know that He is God.";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function SilenceTimer() {
  const [selectedSeconds, setSelectedSeconds] = useState(defaultSeconds);
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // useEffect lets React run code after the screen updates.
  // Here, we use it to start a one-second countdown only when the timer is running.
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          setIsRunning(false);
          setHasEnded(true);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    // This cleanup runs when the timer pauses, resets, or the component leaves the page.
    // It stops old intervals so the countdown does not accidentally run twice.
    return () => window.clearInterval(interval);
  }, [isRunning]);

  function chooseMinutes(minutes: number) {
    const nextSeconds = minutes * 60;

    setSelectedSeconds(nextSeconds);
    setSecondsLeft(nextSeconds);
    setIsRunning(false);
    setHasEnded(false);
  }

  function resetTimer() {
    setSecondsLeft(selectedSeconds);
    setIsRunning(false);
    setHasEnded(false);
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-vellum shadow-soft sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-wheat">Silence timer</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {minuteOptions.map((minutes) => {
          const isSelected = selectedSeconds === minutes * 60;

          return (
            <button
              key={minutes}
              type="button"
              onClick={() => chooseMinutes(minutes)}
              className={`min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isSelected
                  ? "border-wheat bg-wheat text-ink"
                  : "border-vellum/20 text-vellum hover:bg-vellum/10"
              }`}
            >
              {minutes} min
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-6xl leading-none tracking-normal sm:text-7xl">{formatTime(secondsLeft)}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-vellum/70">
            {hasEnded ? timerCompleteMessage : "A simple pause for quiet attention before God."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:w-72">
          <button
            type="button"
            onClick={() => {
              setHasEnded(false);
              setIsRunning(true);
            }}
            disabled={isRunning || secondsLeft === 0}
            className="rounded-full bg-vellum px-3 py-3 text-sm font-semibold text-ink transition hover:bg-wheat disabled:cursor-not-allowed disabled:opacity-45"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
            className="rounded-full border border-vellum/20 px-3 py-3 text-sm font-semibold text-vellum transition hover:bg-vellum/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="rounded-full border border-vellum/20 px-3 py-3 text-sm font-semibold text-vellum transition hover:bg-vellum/10"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
