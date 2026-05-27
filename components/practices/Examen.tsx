"use client";

import { useEffect, useState } from "react";
import { loadPracticeEntriesByDiscipline, savePracticeEntry, type PracticeEntry } from "@/src/lib/practiceEntries";
import { practiceStatusClass } from "@/components/practices/practice-ui";

function getWeekStartDate() {
  const today = new Date();
  const day = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - day);

  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const date = String(weekStart.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export default function Examen() {
  const [presence, setPresence] = useState("");
  const [resistance, setResistance] = useState("");
  const [freeWrite, setFreeWrite] = useState("");
  const [weeklyEntries, setWeeklyEntries] = useState<PracticeEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const isSunday = new Date().getDay() === 0;

  useEffect(() => {
    if (!isSunday) {
      return;
    }

    async function loadWeek() {
      const { entries } = await loadPracticeEntriesByDiscipline("Journaling", getWeekStartDate());
      setWeeklyEntries(entries);
    }

    loadWeek();
  }, [isSunday]);

  async function saveExamen() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Journaling",
      notes: `Where I noticed God's presence:\n${presence.trim()}\n\nWhere I resisted:\n${resistance.trim()}\n\nFree write:\n${freeWrite.trim()}`
    });

    if (error) {
      setStatusMessage(error);
      setStatusTone("error");
      return;
    }

    setStatusMessage("Saved as a dated noticing on your dashboard.");
    setStatusTone("success");
    setPresence("");
    setResistance("");
    setFreeWrite("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr] lg:items-start">
      <div className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Examen</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="font-serif text-2xl text-ink">Where did I notice God&apos;s presence?</span>
            <textarea
              value={presence}
              onChange={(event) => {
                setPresence(event.target.value);
                setStatusMessage("");
              }}
              className="form-field mt-3 min-h-36 resize-none leading-7"
            />
          </label>
          <label className="block">
            <span className="font-serif text-2xl text-ink">Where did I resist?</span>
            <textarea
              value={resistance}
              onChange={(event) => {
                setResistance(event.target.value);
                setStatusMessage("");
              }}
              className="form-field mt-3 min-h-36 resize-none leading-7"
            />
          </label>
        </div>
        <label htmlFor="examen-free-write" className="mt-5 block font-serif text-2xl text-ink">
          Free write
        </label>
        <textarea
          id="examen-free-write"
          value={freeWrite}
          onChange={(event) => {
            setFreeWrite(event.target.value);
            setStatusMessage("");
          }}
          placeholder="Let the day speak plainly."
          className="form-field mt-3 min-h-44 resize-none leading-7"
        />
        <button
          type="button"
          onClick={saveExamen}
          disabled={!presence.trim() && !resistance.trim() && !freeWrite.trim()}
          className="primary-button mt-5 w-full"
        >
          Save Examen
        </button>
        {statusMessage ? (
          <p className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${practiceStatusClass(statusTone)}`}>
            {statusMessage}
          </p>
        ) : null}
      </div>

      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Sunday review</p>
        <h2 className="mt-3 font-serif text-3xl text-ink">This week&apos;s noticings</h2>
        <div className="mt-5 space-y-3">
          {isSunday ? (
            weeklyEntries.length > 0 ? (
              weeklyEntries.map((entry) => (
                <article key={entry.id} className="quiet-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{entry.entry_date}</p>
                  <p className="mt-2 line-clamp-5 text-sm leading-6 text-ink/70">{entry.notes}</p>
                </article>
              ))
            ) : (
              <p className="status-note">No Examen entries saved yet this week.</p>
            )
          ) : (
            <p className="status-note">On Sundays, this space gathers the week&apos;s Examen entries for review.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
