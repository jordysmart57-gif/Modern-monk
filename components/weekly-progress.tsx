"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getTodaysRulePractices,
  normalizeRuleOfLifePractices,
  type RuleOfLifePractice
} from "@/src/lib/ruleOfLife";
import {
  loadPracticeEntriesByDateRange,
  type PracticeEntry
} from "@/src/lib/practiceEntries";
import { supabase } from "@/src/lib/supabaseClient";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getWeekDays() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date: formatDate(date),
      label: date.toLocaleDateString("en-US", { weekday: "short" })
    };
  });
}

function shortNote(note: string) {
  return note
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? note;
}

export default function WeeklyProgress() {
  const weekDays = useMemo(() => getWeekDays(), []);
  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [scheduledByDate, setScheduledByDate] = useState<Record<string, number>>({});
  const [rulePractices, setRulePractices] = useState<RuleOfLifePractice[]>([]);
  const [statusMessage, setStatusMessage] = useState("Loading this week's review...");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadWeeklyReview() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before loading this week's review.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsLoggedIn(false);
        setStatusMessage("Log in to see this week's review.");
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: preferences, error: preferencesError } = await supabase
        .from("rule_of_life_preferences")
        .select("disciplines, practices")
        .eq("user_id", user.id)
        .maybeSingle();

      if (preferencesError) {
        setStatusMessage("Could not load your selected rhythm. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      const chosenPractices = normalizeRuleOfLifePractices(preferences?.practices, preferences?.disciplines);
      const { entries: weekEntries, error: entriesError } = await loadPracticeEntriesByDateRange(
        weekDays[0].date,
        weekDays[weekDays.length - 1].date
      );

      if (entriesError && !entriesError.includes("Log in")) {
        setStatusMessage(entriesError);
        setIsLoading(false);
        return;
      }

      setRulePractices(chosenPractices);
      setEntries(weekEntries);
      setScheduledByDate(
        Object.fromEntries(
          weekDays.map((day) => [
            day.date,
            getTodaysRulePractices(chosenPractices, new Date(`${day.date}T12:00:00`)).length
          ])
        )
      );
      setStatusMessage("This week's review loaded.");
      setIsLoading(false);
    }

    loadWeeklyReview();
  }, [weekDays]);

  const entriesByDate = useMemo(() => {
    return entries.reduce<Record<string, PracticeEntry[]>>((groupedEntries, entry) => {
      groupedEntries[entry.entry_date] = [...(groupedEntries[entry.entry_date] ?? []), entry];
      return groupedEntries;
    }, {});
  }, [entries]);

  const disciplinesNoticed = Array.from(new Set(entries.map((entry) => entry.discipline)));
  const recentEntries = entries.slice(0, 4);

  return (
    <div className="soft-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">This week&apos;s review</h2>
          <p className="mt-1 text-sm text-ink/60">
            {isLoading ? "Loading your rhythm..." : "A quiet look at the noticings you saved."}
          </p>
        </div>
        {isLoading ? (
          <span className="loading-line h-7 w-16" />
        ) : (
          <p className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
            {entries.length} noticings
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayEntries = entriesByDate[day.date] ?? [];
          const scheduled = scheduledByDate[day.date] ?? 0;

          return (
            <div key={day.date} className="rounded-2xl border border-ink/10 bg-parchment px-2 py-3 text-center">
              <p className="text-xs font-semibold text-ink/50">{day.label}</p>
              <p className="mt-2 font-serif text-2xl text-ink">{dayEntries.length}</p>
              <p className="mt-1 text-[11px] text-ink/40">{scheduled} invited</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="quiet-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Practices noticed</p>
          <p className="mt-3 leading-7 text-ink/70">
            {disciplinesNoticed.length > 0 ? disciplinesNoticed.join(", ") : "No saved noticings this week yet."}
          </p>
        </div>
        <div className="quiet-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Rule in this season</p>
          <p className="mt-3 leading-7 text-ink/70">
            {rulePractices.length > 0
              ? `${rulePractices.length} practices held in your current rhythm.`
              : "Set your rule of life to shape this space."}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Recent noticings</p>
        <div className="mt-3 space-y-3">
          {isLoading ? (
            [0, 1].map((item) => (
              <div key={item} className="quiet-card space-y-3">
                <div className="loading-line h-3 w-24" />
                <div className="loading-line h-4 w-full" />
                <div className="loading-line h-4 w-2/3" />
              </div>
            ))
          ) : recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <article key={entry.id} className="quiet-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                  {entry.discipline} · {entry.entry_date}
                </p>
                <p className="mt-2 line-clamp-4 leading-7 text-ink/70">{shortNote(entry.notes)}</p>
              </article>
            ))
          ) : (
            <p className="status-note">
              Open a guided practice and save one sentence about what you noticed. It will gather here.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-white/40 px-4 py-3 text-xs leading-5 text-ink/50">
        {isLoggedIn ? (
          <span>{statusMessage}</span>
        ) : (
          <span>
            {statusMessage}{" "}
            <Link href="/login" className="font-semibold text-ember underline decoration-clay/40 underline-offset-4">
              Go to login
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}
