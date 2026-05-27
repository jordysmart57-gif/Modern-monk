"use client";

import { useState } from "react";
import DailyDisciplines from "@/components/daily-disciplines";
import JournalEntry from "@/components/journal-entry";
import SilenceTimer from "@/components/silence-timer";
import WeeklyProgress from "@/components/weekly-progress";

export default function DashboardClient() {
  const [weeklyRefreshKey, setWeeklyRefreshKey] = useState(0);

  return (
    <section className="grid gap-4 pb-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <DailyDisciplines onSaved={() => setWeeklyRefreshKey((current) => current + 1)} />
        <SilenceTimer />
      </div>

      <div className="space-y-4">
        <JournalEntry />
        <WeeklyProgress refreshKey={weeklyRefreshKey} />
      </div>
    </section>
  );
}
