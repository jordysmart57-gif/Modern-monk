"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabaseClient";

const dailyDisciplines = [
  "Pray for 10 minutes",
  "Read Scripture",
  "Practice 5 minutes of silence",
  "Journal one reflection",
  "Practice gratitude",
  "Avoid one distraction"
];

type DisciplineRow = {
  id: string;
  name: string;
  completed: boolean;
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

type DailyDisciplinesProps = {
  onSaved?: () => void;
};

export default function DailyDisciplines({ onSaved }: DailyDisciplinesProps) {
  // React state is memory for this component while the page is open.
  // Here it remembers which disciplines are checked for today.
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, DisciplineRow>>({});
  const [user, setUser] = useState<User | null>(null);
  const [statusMessage, setStatusMessage] = useState("Loading today's disciplines...");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const [isLoading, setIsLoading] = useState(true);

  const completedCount = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems]
  );
  const completionPercent = Math.round((completedCount / dailyDisciplines.length) * 100);

  useEffect(() => {
    async function loadTodayDisciplines() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before saving disciplines.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      // First we ask Supabase which user is logged in on this browser.
      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setStatusMessage("Log in to save today's disciplines.");
        setStatusTone("neutral");
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // Then we load only this user's rows for today's date.
      const { data, error } = await supabase
        .from("disciplines")
        .select("id, name, completed")
        .eq("user_id", currentUser.id)
        .eq("completed_date", getTodayDate());

      if (error) {
        setStatusMessage(error.message);
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      const nextCheckedItems: Record<string, boolean> = {};
      const nextSavedRows: Record<string, DisciplineRow> = {};

      for (const row of data ?? []) {
        nextCheckedItems[row.name] = row.completed;
        nextSavedRows[row.name] = row;
      }

      setCheckedItems(nextCheckedItems);
      setSavedRows(nextSavedRows);
      setStatusMessage("Today's disciplines loaded.");
      setStatusTone("success");
      setIsLoading(false);
    }

    loadTodayDisciplines();
  }, []);

  async function toggleDiscipline(discipline: string) {
    if (!supabase || !user) {
      setStatusMessage("Log in to save today's disciplines.");
      setStatusTone("neutral");
      return;
    }

    const nextCompleted = !checkedItems[discipline];

    // setCheckedItems asks React to update the screen with the new checked value.
    // We update immediately so the app feels fast, then save the same change to Supabase.
    setCheckedItems((currentItems) => ({
      ...currentItems,
      [discipline]: nextCompleted
    }));
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const existingRow = savedRows[discipline];

    if (existingRow) {
      const { error } = await supabase
        .from("disciplines")
        .update({ completed: nextCompleted })
        .eq("id", existingRow.id);

      if (error) {
        setStatusMessage(error.message);
        setStatusTone("error");
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("disciplines")
        .insert({
          user_id: user.id,
          name: discipline,
          completed: nextCompleted,
          completed_date: getTodayDate()
        })
        .select("id, name, completed")
        .single();

      if (error) {
        setStatusMessage(error.message);
        setStatusTone("error");
        return;
      }

      setSavedRows((currentRows) => ({
        ...currentRows,
        [discipline]: data
      }));
    }

    setStatusMessage("Saved to Supabase.");
    setStatusTone("success");
    onSaved?.();
  }

  return (
    <div className="soft-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">Daily disciplines</h2>
          <p className="mt-1 text-sm text-ink/60">
            {isLoading ? "Loading..." : `${completedCount} of ${dailyDisciplines.length} practiced`}
          </p>
        </div>
        {isLoading ? (
          <div className="loading-line h-16 w-16 rounded-full" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-clay/25 bg-parchment font-serif text-xl text-ember">
            {completionPercent}%
          </div>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {isLoading
          ? dailyDisciplines.slice(0, 4).map((discipline) => (
              <div key={discipline} className="quiet-card flex min-h-14 items-center gap-3">
                <span className="loading-line h-5 w-5 rounded" />
                <span className="loading-line h-4 w-2/3" />
              </div>
            ))
          : dailyDisciplines.map((discipline) => {
          const isChecked = checkedItems[discipline] ?? false;

          return (
            <label
              key={discipline}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                isChecked
                  ? "border-moss/25 bg-moss/10 text-ink"
                  : "border-ink/10 bg-white/50 text-ink/70 hover:border-clay/30"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleDiscipline(discipline)}
                disabled={isLoading || !user}
                className="h-5 w-5 rounded border-ink/20 accent-clay"
              />
              <span className={isChecked ? "font-medium line-through decoration-clay/60" : ""}>
                {discipline}
              </span>
              {isChecked ? (
                <span className="ml-auto rounded-full bg-moss/15 px-2 py-1 text-xs font-semibold text-moss">
                  Complete
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <div
        className={`mt-4 rounded-2xl px-4 py-3 text-xs leading-5 ${
          statusTone === "error"
            ? "border border-ember/20 bg-ember/5 text-ember"
            : statusTone === "success"
              ? "border border-moss/15 bg-moss/10 text-moss"
              : "border border-ink/10 bg-white/40 text-ink/50"
        }`}
      >
        {user ? (
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
