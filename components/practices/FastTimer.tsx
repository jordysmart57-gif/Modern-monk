"use client";

import { useEffect, useMemo, useState } from "react";
import { savePracticeEntry } from "@/src/lib/practiceEntries";
import { formatCountUpTime, practiceStatusClass } from "@/components/practices/practice-ui";

type FastType = "Food" | "Meal";

const pullPrayer = "Lord, teach me to receive my life from You.";

export default function FastTimer() {
  const [fastType, setFastType] = useState<FastType>("Meal");
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pullMoments, setPullMoments] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  const isRunning = Boolean(startedAt);
  const pullSummary = useMemo(() => pullMoments.join(", "), [pullMoments]);

  useEffect(() => {
    if (!startedAt) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [startedAt]);

  function beginFast() {
    setStartedAt(new Date());
    setElapsedSeconds(0);
    setPullMoments([]);
    setStatusMessage("");
  }

  function logPull() {
    const moment = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });

    setPullMoments((current) => [...current, moment]);
    setStatusMessage(pullPrayer);
    setStatusTone("neutral");
  }

  async function saveReflection() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Fasting",
      notes: `${fastType} fast\nTime noticed: ${formatCountUpTime(elapsedSeconds)}\nPull moments: ${pullSummary || "None noted"}\nReflection: ${reflection.trim()}`
    });

    if (error) {
      setStatusMessage(error);
      setStatusTone("error");
      return;
    }

    setStatusMessage("Saved as a dated noticing on your dashboard.");
    setStatusTone("success");
    setStartedAt(null);
    setReflection("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-start">
      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Food fast</p>
        <h2 className="mt-3 font-serif text-3xl text-ink">Begin gently.</h2>
        <p className="mt-3 leading-7 text-ink/70">
          This practice treats fasting as food-only. Choose a meal or food fast, then notice the pull without
          turning it into performance.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["Meal", "Food"] as FastType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFastType(type)}
              disabled={isRunning}
              className={`min-h-11 rounded-full border px-3 text-sm font-semibold transition ${
                fastType === type
                  ? "border-clay bg-clay text-vellum"
                  : "border-ink/10 bg-white/40 text-ink/60 hover:border-clay/40"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {type}
            </button>
          ))}
        </div>
        <button type="button" onClick={beginFast} disabled={isRunning} className="primary-button mt-5 w-full">
          Start Noticing
        </button>
      </aside>

      <div className="rounded-3xl border border-ink/10 bg-vellum p-6 shadow-soft sm:p-8">
        <div className="flex min-h-[330px] flex-col justify-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">{fastType} fast</p>
          <p className="mt-6 font-serif text-7xl leading-none text-ink sm:text-8xl">{formatCountUpTime(elapsedSeconds)}</p>
          <p className="mx-auto mt-6 max-w-md leading-7 text-ink/65">
            When hunger or habit rises, do not score it. Notice it, pray simply, and return.
          </p>
          <button
            type="button"
            onClick={logPull}
            disabled={!isRunning}
            className="secondary-button mx-auto mt-8 disabled:cursor-not-allowed disabled:opacity-45"
          >
            I felt the pull
          </button>
          {pullMoments.length > 0 ? (
            <p className="mt-4 text-sm leading-6 text-moss">
              {pullPrayer} ({pullMoments.length} noted)
            </p>
          ) : null}
        </div>
      </div>

      <aside className="soft-card lg:col-start-2">
        <label htmlFor="fast-reflection" className="block font-serif text-3xl text-ink">
          End with reflection
        </label>
        <textarea
          id="fast-reflection"
          value={reflection}
          onChange={(event) => {
            setReflection(event.target.value);
            setStatusMessage("");
          }}
          placeholder="What did hunger or habit reveal?"
          className="form-field mt-5 min-h-32 resize-none leading-7"
        />
        <button type="button" onClick={saveReflection} disabled={!reflection.trim()} className="primary-button mt-4 w-full">
          End and Save
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
