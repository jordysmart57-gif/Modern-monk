"use client";

import { useEffect, useState } from "react";
import { scriptureStudySuggestions } from "@/src/lib/ruleOfLife";
import { savePracticeEntry } from "@/src/lib/practiceEntries";
import { formatPracticeTime, practiceStatusClass } from "@/components/practices/practice-ui";

const stages = [
  {
    title: "Read",
    prompt: "Read the passage slowly. Let it be received before it is analyzed."
  },
  {
    title: "Meditate",
    prompt: "Notice a word or phrase that stays with you."
  },
  {
    title: "Pray",
    prompt: "Turn what you noticed into a plain prayer."
  },
  {
    title: "Contemplate",
    prompt: "Rest quietly for two minutes with God."
  }
];

export default function LectioDivina() {
  const [passage, setPassage] = useState(scriptureStudySuggestions[0].passage);
  const [customPassage, setCustomPassage] = useState("");
  const [stageIndex, setStageIndex] = useState(0);
  const [silenceSeconds, setSilenceSeconds] = useState(2 * 60);
  const [isSilent, setIsSilent] = useState(false);
  const [word, setWord] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  const activeStage = stages[stageIndex];
  const selectedPassage = customPassage.trim() || passage;

  useEffect(() => {
    if (!isSilent) {
      return;
    }

    const timerId = window.setInterval(() => {
      setSilenceSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          window.clearInterval(timerId);
          setIsSilent(false);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isSilent]);

  async function saveWord() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Scripture",
      notes: `Passage: ${selectedPassage}\nWord or phrase: ${word.trim()}`
    });

    if (error) {
      setStatusMessage(error);
      setStatusTone("error");
      return;
    }

    setStatusMessage("Saved as a dated noticing on your dashboard.");
    setStatusTone("success");
    setWord("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-start">
      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Passage</p>
        <select
          value={passage}
          onChange={(event) => {
            setPassage(event.target.value);
            setCustomPassage("");
          }}
          className="form-field mt-4"
        >
          {scriptureStudySuggestions.slice(0, 6).map((suggestion) => (
            <option key={suggestion.passage}>{suggestion.passage}</option>
          ))}
        </select>
        <label htmlFor="custom-passage" className="mt-4 block text-sm font-semibold text-ink">
          Or paste a passage reference
        </label>
        <input
          id="custom-passage"
          value={customPassage}
          onChange={(event) => setCustomPassage(event.target.value)}
          placeholder="John 15:1-11"
          className="form-field mt-2"
        />
      </aside>

      <div className="rounded-3xl border border-ink/10 bg-vellum p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap gap-2">
          {stages.map((stage, index) => (
            <button
              key={stage.title}
              type="button"
              onClick={() => setStageIndex(index)}
              className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                stageIndex === index
                  ? "border-clay bg-clay text-vellum"
                  : "border-ink/10 bg-white/40 text-ink/60 hover:border-clay/40"
              }`}
            >
              {stage.title}
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-[310px]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">{selectedPassage}</p>
          <h2 className="mt-4 font-serif text-5xl text-ink">{activeStage.title}</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/70">{activeStage.prompt}</p>

          {activeStage.title === "Contemplate" ? (
            <div className="mt-8 rounded-3xl border border-ink/10 bg-parchment p-6 text-center">
              <p className="font-serif text-6xl text-ink">{formatPracticeTime(silenceSeconds)}</p>
              <button
                type="button"
                onClick={() => setIsSilent(true)}
                disabled={isSilent || silenceSeconds === 0}
                className="primary-button mt-5"
              >
                Begin silence
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="soft-card lg:col-start-2">
        <label htmlFor="lectio-word" className="block font-serif text-3xl text-ink">
          Word or phrase that stood out
        </label>
        <input
          id="lectio-word"
          value={word}
          onChange={(event) => {
            setWord(event.target.value);
            setStatusMessage("");
          }}
          placeholder="Abide"
          className="form-field mt-5"
        />
        <button type="button" onClick={saveWord} disabled={!word.trim()} className="primary-button mt-4 w-full">
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
