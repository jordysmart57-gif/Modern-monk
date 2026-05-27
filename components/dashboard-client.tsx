"use client";

import { useMemo } from "react";
import DailyDisciplines from "@/components/daily-disciplines";
import JournalEntry from "@/components/journal-entry";
import SilenceTimer from "@/components/silence-timer";

const totalDailyDisciplines = 6;

const weeklyProgress = [
  { day: "Mon", completed: 5 },
  { day: "Tue", completed: 3 },
  { day: "Wed", completed: 6 },
  { day: "Thu", completed: 4 },
  { day: "Fri", completed: 2 },
  { day: "Sat", completed: 6 },
  { day: "Sun", completed: 5 }
];

export default function DashboardClient() {
  const weeklyCompleted = useMemo(
    () => weeklyProgress.reduce((total, day) => total + day.completed, 0),
    []
  );
  const weeklyPossible = weeklyProgress.length * totalDailyDisciplines;

  return (
    <section className="grid gap-4 pb-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <DailyDisciplines />
        <SilenceTimer />
      </div>

      <div className="space-y-4">
        <JournalEntry />

        <div className="rounded-3xl border border-ink/10 bg-vellum/90 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl text-ink">Weekly progress</h2>
              <p className="mt-1 text-sm text-ink/60">Placeholder rhythm for now.</p>
            </div>
            <p className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
              {weeklyCompleted}/{weeklyPossible}
            </p>
          </div>

          <div className="mt-6 flex h-40 items-end gap-2">
            {weeklyProgress.map((day) => (
              <div key={day.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end rounded-full bg-parchment">
                  <div
                    className="w-full rounded-full bg-clay transition-all"
                    style={{ height: `${(day.completed / totalDailyDisciplines) * 100}%` }}
                    aria-label={`${day.day}: ${day.completed} disciplines`}
                  />
                </div>
                <span className="text-xs font-semibold text-ink/50">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
