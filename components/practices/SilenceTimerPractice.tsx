"use client";

import { useEffect, useRef, useState } from "react";
import { savePracticeEntry } from "@/src/lib/practiceEntries";

const durationOptions = [2, 5, 10, 20];

type BrowserWindowWithAudioFallback = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function SilenceTimerPractice() {
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [noticed, setNoticed] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const audioContextRef = useRef<AudioContext | null>(null);

  function playChime() {
    const browserWindow = window as BrowserWindowWithAudioFallback;
    const AudioContextClass = browserWindow.AudioContext || browserWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const audioContext = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = audioContext;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.6);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1.7);
  }

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timerId);
          setIsRunning(false);
          setHasEnded(true);
          playChime();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning]);

  function chooseDuration(minutes: number) {
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setIsRunning(false);
    setHasStarted(false);
    setHasEnded(false);
    setStatusMessage("");
  }

  function beginSilence() {
    setHasStarted(true);
    setHasEnded(false);
    setStatusMessage("");
    setIsRunning(true);
    playChime();
  }

  function resetSilence() {
    setSecondsLeft(selectedMinutes * 60);
    setIsRunning(false);
    setHasStarted(false);
    setHasEnded(false);
    setStatusMessage("");
  }

  async function saveNoticing() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Silence",
      notes: noticed
    });

    if (error) {
      setStatusMessage(error);
      setStatusTone("error");
      return;
    }

    setStatusMessage("Saved as a dated noticing on your dashboard.");
    setStatusTone("success");
    setNoticed("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr] lg:items-start">
      <div className="rounded-3xl border border-ink/10 bg-ink p-5 text-vellum shadow-soft sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-wheat">Silence timer</p>
          <span className="rounded-full border border-vellum/15 px-3 py-1 text-xs font-semibold text-vellum/70">
            {hasEnded ? "Closed" : hasStarted ? "In silence" : "Ready"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          {durationOptions.map((minutes) => {
            const isSelected = selectedMinutes === minutes;

            return (
              <button
                key={minutes}
                type="button"
                onClick={() => chooseDuration(minutes)}
                disabled={isRunning}
                className={`min-h-11 rounded-full border px-2 text-sm font-semibold transition ${
                  isSelected
                    ? "border-wheat bg-wheat text-ink"
                    : "border-vellum/20 text-vellum hover:bg-vellum/10"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                {minutes}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-[360px] flex-col items-center justify-center py-10 text-center sm:min-h-[440px]">
          <p className="font-serif text-7xl leading-none tracking-normal sm:text-8xl">
            {formatTime(secondsLeft)}
          </p>
          <p className="mt-5 max-w-sm text-sm leading-7 text-vellum/70">
            {hasEnded
              ? "Carry the quiet gently. When you are ready, write only what you noticed."
              : "Begin without hurry. Let the sound mark the opening, then let the quiet be enough."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={beginSilence}
            disabled={isRunning || secondsLeft === 0}
            className="min-h-12 rounded-full bg-vellum px-3 text-sm font-semibold text-ink transition hover:bg-wheat disabled:cursor-not-allowed disabled:opacity-45"
          >
            Start
          </button>
          <button
            type="button"
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
            className="min-h-12 rounded-full border border-vellum/20 px-3 text-sm font-semibold text-vellum transition hover:bg-vellum/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={resetSilence}
            className="min-h-12 rounded-full border border-vellum/20 px-3 text-sm font-semibold text-vellum transition hover:bg-vellum/10"
          >
            Reset
          </button>
        </div>
      </div>

      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Afterward</p>
        <label htmlFor="silence-noticing" className="mt-3 block font-serif text-3xl text-ink">
          What did you notice?
        </label>
        <textarea
          id="silence-noticing"
          value={noticed}
          onChange={(event) => {
            setNoticed(event.target.value);
            setStatusMessage("");
          }}
          placeholder="One honest sentence is enough."
          className="form-field mt-5 min-h-40 resize-none leading-7"
        />
        <button
          type="button"
          onClick={saveNoticing}
          className="primary-button mt-4 w-full"
          disabled={!noticed.trim()}
        >
          Save Noticing
        </button>
        {statusMessage ? (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
              statusTone === "error"
                ? "border border-ember/20 bg-ember/5 text-ember"
                : statusTone === "success"
                  ? "border border-moss/15 bg-moss/10 text-moss"
                  : "border border-ink/10 bg-white/40 text-ink/60"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
