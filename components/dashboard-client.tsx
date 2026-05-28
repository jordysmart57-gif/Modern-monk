"use client";

import DailyDisciplines from "@/components/daily-disciplines";
import JournalEntry from "@/components/journal-entry";
import RecentPracticeEntries from "@/components/practices/RecentPracticeEntries";
import SilenceTimer from "@/components/silence-timer";
import WeeklyProgress from "@/components/weekly-progress";

export default function DashboardClient() {
  return (
    <section className="grid gap-4 pb-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-4">
        <DailyDisciplines />
        <SilenceTimer />
      </div>

      <div className="space-y-4">
        <JournalEntry />
        <RecentPracticeEntries />
        <WeeklyProgress />
      </div>
    </section>
  );
}
