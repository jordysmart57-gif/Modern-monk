"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadRecentPracticeEntries, type PracticeEntry } from "@/src/lib/practiceEntries";

export default function RecentPracticeEntries() {
  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [message, setMessage] = useState("Loading saved noticings...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      const { entries: loadedEntries, error } = await loadRecentPracticeEntries(5);

      setEntries(loadedEntries);
      setMessage(error ?? "Recent noticings loaded.");
      setIsLoading(false);
    }

    loadEntries();
  }, []);

  return (
    <div className="soft-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">Saved noticings</h2>
          <p className="mt-1 text-sm text-ink/60">Dated reflections from guided practices.</p>
        </div>
        <Link href="/disciplines/silence" className="secondary-button min-h-9 px-3 py-2 text-xs">
          Practice
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          [0, 1].map((item) => (
            <div key={item} className="quiet-card space-y-3">
              <div className="loading-line h-3 w-28" />
              <div className="loading-line h-4 w-full" />
              <div className="loading-line h-4 w-2/3" />
            </div>
          ))
        ) : entries.length > 0 ? (
          entries.map((entry) => (
            <article key={entry.id} className="quiet-card">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                {entry.discipline} · {entry.entry_date}
              </p>
              <p className="mt-2 leading-7 text-ink/70">{entry.notes}</p>
            </article>
          ))
        ) : (
          <p className="status-note">
            {message.includes("Log in")
              ? "Log in to see saved noticings from guided practices."
              : "No saved noticings yet. The first one can be a single sentence after silence."}
          </p>
        )}
      </div>
    </div>
  );
}
