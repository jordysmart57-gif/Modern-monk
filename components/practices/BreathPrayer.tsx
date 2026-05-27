"use client";

import { useEffect, useState } from "react";
import { savePracticeEntry } from "@/src/lib/practiceEntries";
import { formatPracticeTime, playSoftChime, practiceStatusClass } from "@/components/practices/practice-ui";

const durationOptions = [3, 5, 10];

export default function BreathPrayer() {
  const [phrase, setPhrase] = useState("Lord Jesus Christ, have mercy.");
  const [selectedMinutes, setSelectedMinutes] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(3 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [noticed, setNoticed] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

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
          playSoftChime();
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
    setHasEnded(false);
    setStatusMessage("");
  }

  async function saveNoticing() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Prayer",
      notes: `Breath prayer: ${phrase.trim()}\nNoticed: ${noticed.trim()}`
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
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-start">
      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Breath prayer</p>
        <label htmlFor="breath-phrase" className="mt-3 block font-serif text-3xl text-ink">
          Short phrase
        </label>
        <input
          id="breath-phrase"
          value={phrase}
          onChange={(event) => setPhrase(event.target.value)}
          className="form-field mt-5"
        />
        <div className="mt-5 grid grid-cols-3 gap-2">
          {durationOptions.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => chooseDuration(minutes)}
              disabled={isRunning}
              className={`min-h-11 rounded-full border px-3 text-sm font-semibold transition ${
                selectedMinutes === minutes
                  ? "border-clay bg-clay text-vellum"
                  : "border-ink/10 bg-white/40 text-ink/60 hover:border-clay/40"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {minutes} min
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setHasEnded(false);
            setIsRunning(true);
          }}
          disabled={isRunning || !phrase.trim() || secondsLeft === 0}
          className="primary-button mt-5 w-full"
        >
          Begin
        </button>
      </aside>

      <div className="rounded-3xl border border-ink/10 bg-ink p-5 text-center text-vellum shadow-soft sm:p-8">
        <div className="flex min-h-[360px] flex-col items-center justify-center">
          <div className={`flex h-52 w-52 items-center justify-center rounded-full border border-wheat/30 bg-vellum/5 ${isRunning ? "animate-breath-prayer" : ""}`}>
            <div className="h-32 w-32 rounded-full border border-wheat/20 bg-wheat/10" />
          </div>
          <p className="mt-8 font-serif text-4xl leading-tight">{phrase}</p>
          <p className="mt-4 text-sm uppercase tracking-[0.22em] text-wheat">
            {isRunning ? "Inhale 4, exhale 6" : hasEnded ? "Rest" : "Ready"}
          </p>
          <p className="mt-3 font-serif text-4xl">{formatPracticeTime(secondsLeft)}</p>
          <div className="mt-7 grid w-full grid-cols-2 gap-2 sm:w-80">
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
              onClick={() => {
                setSecondsLeft(selectedMinutes * 60);
                setIsRunning(false);
                setHasEnded(false);
              }}
              className="min-h-12 rounded-full border border-vellum/20 px-3 text-sm font-semibold text-vellum transition hover:bg-vellum/10"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <aside className="soft-card lg:col-start-2">
        <label htmlFor="prayer-noticing" className="block font-serif text-3xl text-ink">
          What did the prayer make room for?
        </label>
        <textarea
          id="prayer-noticing"
          value={noticed}
          onChange={(event) => {
            setNoticed(event.target.value);
            setStatusMessage("");
          }}
          placeholder="One sentence is enough."
          className="form-field mt-5 min-h-32 resize-none leading-7"
        />
        <button type="button" onClick={saveNoticing} disabled={!noticed.trim()} className="primary-button mt-4 w-full">
          Save Noticing
        </button>
        {statusMessage ? (
          <p className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${practiceStatusClass(statusTone)}`}>
            {statusMessage}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
