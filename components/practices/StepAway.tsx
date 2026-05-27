"use client";

import { useEffect, useState } from "react";
import { savePracticeEntry } from "@/src/lib/practiceEntries";
import { formatPracticeTime, practiceStatusClass } from "@/components/practices/practice-ui";

const durationOptions = [5, 10, 20, 30];

export default function StepAway() {
  const [place, setPlace] = useState("");
  const [layingDown, setLayingDown] = useState("");
  const [selectedMinutes, setSelectedMinutes] = useState(10);
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);
  const [isAway, setIsAway] = useState(false);
  const [reflection, setReflection] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  useEffect(() => {
    if (!isAway) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timerId);
          setIsAway(false);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isAway]);

  function chooseDuration(minutes: number) {
    setSelectedMinutes(minutes);
    setSecondsLeft(minutes * 60);
    setIsAway(false);
  }

  async function saveReflection() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Solitude",
      notes: `Went to: ${place.trim() || "A quiet place"}\nLaid down: ${layingDown.trim() || "Unspecified"}\nReturned noticing: ${reflection.trim()}`
    });

    if (error) {
      setStatusMessage(error);
      setStatusTone("error");
      return;
    }

    setStatusMessage("Saved as a dated noticing on your dashboard.");
    setStatusTone("success");
    setReflection("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-start">
      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Before you step away</p>
        <label htmlFor="solitude-place" className="mt-4 block text-sm font-semibold text-ink">
          Where are you going?
        </label>
        <input
          id="solitude-place"
          value={place}
          onChange={(event) => setPlace(event.target.value)}
          placeholder="The porch, a walk, a quiet room..."
          className="form-field mt-2"
        />
        <label htmlFor="solitude-lay-down" className="mt-4 block text-sm font-semibold text-ink">
          What are you laying down?
        </label>
        <textarea
          id="solitude-lay-down"
          value={layingDown}
          onChange={(event) => setLayingDown(event.target.value)}
          placeholder="Noise, hurry, a task, a screen..."
          className="form-field mt-2 min-h-28 resize-none leading-7"
        />
        <div className="mt-5 grid grid-cols-4 gap-2">
          {durationOptions.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => chooseDuration(minutes)}
              disabled={isAway}
              className={`min-h-11 rounded-full border px-2 text-sm font-semibold transition ${
                selectedMinutes === minutes
                  ? "border-clay bg-clay text-vellum"
                  : "border-ink/10 bg-white/40 text-ink/60 hover:border-clay/40"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {minutes}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setIsAway(true)} disabled={isAway} className="primary-button mt-5 w-full">
          Begin
        </button>
      </aside>

      <div className="rounded-3xl border border-ink/10 bg-parchment p-6 text-center shadow-soft sm:p-8">
        <div className="flex min-h-[360px] flex-col items-center justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            {isAway ? "Away" : secondsLeft === 0 ? "Return slowly" : "Still screen"}
          </p>
          <p className="mt-6 font-serif text-7xl leading-none text-ink sm:text-8xl">{formatPracticeTime(secondsLeft)}</p>
          <p className="mt-6 max-w-md leading-7 text-ink/65">
            Let the place be simple. Let the time be received. Nothing has to be produced here.
          </p>
          <button
            type="button"
            onClick={() => setIsAway(false)}
            disabled={!isAway}
            className="secondary-button mt-8 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Return
          </button>
        </div>
      </div>

      <aside className="soft-card lg:col-start-2">
        <label htmlFor="solitude-reflection" className="block font-serif text-3xl text-ink">
          One sentence from the quiet
        </label>
        <textarea
          id="solitude-reflection"
          value={reflection}
          onChange={(event) => {
            setReflection(event.target.value);
            setStatusMessage("");
          }}
          placeholder="What became clearer when you stepped away?"
          className="form-field mt-5 min-h-32 resize-none leading-7"
        />
        <button type="button" onClick={saveReflection} disabled={!reflection.trim()} className="primary-button mt-4 w-full">
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
