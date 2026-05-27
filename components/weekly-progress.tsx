"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { defaultDailyRhythm } from "@/src/lib/ruleOfLife";
import { supabase } from "@/src/lib/supabaseClient";

type WeeklyProgressProps = {
  refreshKey: number;
};

type DisciplineProgressRow = {
  completed: boolean;
  completed_date: string;
};

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

export default function WeeklyProgress({ refreshKey }: WeeklyProgressProps) {
  const weekDays = useMemo(() => getWeekDays(), []);
  const [completedByDate, setCompletedByDate] = useState<Record<string, number>>({});
  const [dailyRhythm, setDailyRhythm] = useState(defaultDailyRhythm);
  const [statusMessage, setStatusMessage] = useState("Loading weekly progress...");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadWeeklyProgress() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before loading weekly progress.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Supabase tells us who is logged in. We use that id to load only this user's rows.
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setIsLoggedIn(false);
        setStatusMessage("Log in to see your weekly progress.");
        setIsLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const { data: preferences, error: preferencesError } = await supabase
        .from("rule_of_life_preferences")
        .select("disciplines")
        .eq("user_id", user.id)
        .maybeSingle();

      if (preferencesError) {
        setStatusMessage("Could not load your selected rhythm. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      const chosenDisciplines = preferences?.disciplines?.length
        ? preferences.disciplines
        : defaultDailyRhythm;

      setDailyRhythm(chosenDisciplines);

      // This asks Supabase for all saved discipline rows from the last 7 days.
      const { data, error } = await supabase
        .from("disciplines")
        .select("name, completed, completed_date")
        .eq("user_id", user.id)
        .gte("completed_date", weekDays[0].date)
        .lte("completed_date", weekDays[weekDays.length - 1].date);

      if (error) {
        setStatusMessage("Could not load weekly progress. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      const nextCompletedByDate: Record<string, number> = {};

      for (const row of (data ?? []) as Array<DisciplineProgressRow & { name: string }>) {
        if (row.completed && chosenDisciplines.includes(row.name)) {
          nextCompletedByDate[row.completed_date] = (nextCompletedByDate[row.completed_date] ?? 0) + 1;
        }
      }

      setCompletedByDate(nextCompletedByDate);
      setStatusMessage("Weekly progress loaded.");
      setIsLoading(false);
    }

    loadWeeklyProgress();
  }, [refreshKey, weekDays]);

  const weeklyCompleted = weekDays.reduce((total, day) => total + (completedByDate[day.date] ?? 0), 0);
  const weeklyPossible = weekDays.length * dailyRhythm.length;

  return (
    <div className="soft-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">Weekly progress</h2>
          <p className="mt-1 text-sm text-ink/60">
            {isLoading ? "Loading your rhythm..." : "Your selected disciplines over the last 7 days."}
          </p>
        </div>
        {isLoading ? (
          <span className="loading-line h-7 w-16" />
        ) : (
          <p className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
            {weeklyCompleted}/{weeklyPossible}
          </p>
        )}
      </div>

      <div className="mt-6 flex h-40 items-end gap-2">
        {weekDays.map((day) => {
          const completed = completedByDate[day.date] ?? 0;
          const height = isLoading ? 18 : Math.max(8, (completed / Math.max(dailyRhythm.length, 1)) * 100);

          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end rounded-full bg-parchment">
                <div
                  className={`w-full rounded-full transition-all ${isLoading ? "loading-line" : "bg-clay"}`}
                  style={{ height: `${height}%` }}
                  aria-label={`${day.label}: ${completed} disciplines`}
                />
              </div>
              <span className="text-xs font-semibold text-ink/50">{day.label}</span>
            </div>
          );
        })}
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
