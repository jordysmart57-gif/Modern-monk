"use client";

import { useState } from "react";
import { savePracticeEntry } from "@/src/lib/practiceEntries";
import { practiceStatusClass } from "@/components/practices/practice-ui";

export default function SabbathFrame() {
  const [layingDownText, setLayingDownText] = useState("");
  const [delightText, setDelightText] = useState("");
  const [delights, setDelights] = useState<string[]>([]);
  const [blessing, setBlessing] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");

  function addDelight() {
    const nextDelight = delightText.trim();

    if (!nextDelight) {
      return;
    }

    setDelights((current) => [...current, nextDelight]);
    setDelightText("");
  }

  async function saveSabbath() {
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await savePracticeEntry({
      discipline: "Sabbath",
      notes: `Laying down:\n${layingDownText.trim()}\n\nDelights:\n${delights.join("\n") || "None listed"}\n\nBlessing:\n${blessing.trim()}`
    });

    if (error) {
      setStatusMessage(error);
      setStatusTone("error");
      return;
    }

    setStatusMessage("Saved as a dated noticing on your dashboard.");
    setStatusTone("success");
    setBlessing("");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.72fr_1fr] lg:items-start">
      <aside className="soft-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Open the frame</p>
        <label htmlFor="sabbath-laying-down" className="mt-3 block font-serif text-3xl text-ink">
          What are you laying down?
        </label>
        <textarea
          id="sabbath-laying-down"
          value={layingDownText}
          onChange={(event) => setLayingDownText(event.target.value)}
          placeholder="Work, errands, hurry, proving..."
          className="form-field mt-5 min-h-40 resize-none leading-7"
        />
      </aside>

      <div className="rounded-3xl border border-ink/10 bg-parchment p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">24-hour container</p>
        <h2 className="mt-4 font-serif text-5xl text-ink">Receive the day.</h2>
        <p className="mt-5 max-w-2xl leading-7 text-ink/70">
          This frame does not count down or push you forward. Add small delights as they arrive, then close the
          day with a blessing.
        </p>

        <div className="mt-7 rounded-2xl border border-ink/10 bg-white/40 p-4">
          <label htmlFor="sabbath-delight" className="block text-sm font-semibold text-ink">
            Delight log
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="sabbath-delight"
              value={delightText}
              onChange={(event) => setDelightText(event.target.value)}
              placeholder="A meal, a walk, a laugh..."
              className="form-field"
            />
            <button type="button" onClick={addDelight} className="secondary-button shrink-0">
              Add
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {delights.length > 0 ? (
              delights.map((delight, index) => (
                <p key={`${delight}-${index}`} className="rounded-2xl bg-vellum px-4 py-3 text-sm leading-6 text-ink/70">
                  {delight}
                </p>
              ))
            ) : (
              <p className="text-sm leading-6 text-ink/50">No delights logged yet.</p>
            )}
          </div>
        </div>
      </div>

      <aside className="soft-card lg:col-start-2">
        <label htmlFor="sabbath-blessing" className="block font-serif text-3xl text-ink">
          Closing blessing
        </label>
        <textarea
          id="sabbath-blessing"
          value={blessing}
          onChange={(event) => {
            setBlessing(event.target.value);
            setStatusMessage("");
          }}
          placeholder="Name the gift of the day in one or two lines."
          className="form-field mt-5 min-h-32 resize-none leading-7"
        />
        <button type="button" onClick={saveSabbath} disabled={!blessing.trim()} className="primary-button mt-4 w-full">
          Close and Save
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
