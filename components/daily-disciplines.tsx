"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  defaultDailyRhythm,
  disciplineGuidance,
  frequencyLabels,
  getTodaysRulePractices,
  getUpcomingRulePractices,
  normalizeRuleOfLifePractices,
  scriptureStudySuggestions,
  type RuleOfLifePractice
} from "@/src/lib/ruleOfLife";
import { supabase } from "@/src/lib/supabaseClient";

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

const practicePageSlugs: Record<string, string> = {
  Prayer: "prayer",
  Silence: "silence",
  Solitude: "solitude",
  Fasting: "fasting",
  Scripture: "scripture",
  Sabbath: "sabbath",
  Journaling: "journaling"
};

export default function DailyDisciplines({ onSaved }: DailyDisciplinesProps) {
  // React state is memory for this component while the page is open.
  // Here it remembers which disciplines are checked for today.
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [savedRows, setSavedRows] = useState<Record<string, DisciplineRow>>({});
  const [dailyPractices, setDailyPractices] = useState<RuleOfLifePractice[]>([]);
  const [upcomingPractices, setUpcomingPractices] = useState<RuleOfLifePractice[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(defaultDailyRhythm[0]);
  const [scriptureSuggestion, setScriptureSuggestion] = useState(scriptureStudySuggestions[0]);
  const [user, setUser] = useState<User | null>(null);
  const [statusMessage, setStatusMessage] = useState("Loading today's disciplines...");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const [isLoading, setIsLoading] = useState(true);

  const completedCount = useMemo(
    () => Object.values(checkedItems).filter(Boolean).length,
    [checkedItems]
  );
  const selectedGuidance = disciplineGuidance[selectedDiscipline] ?? disciplineGuidance[defaultDailyRhythm[0]];
  const visiblePractices = dailyPractices.length > 0 ? dailyPractices : [];
  const selectedPractice = dailyPractices.find((practice) => practice.discipline === selectedDiscipline);

  useEffect(() => {
    function chooseHourlyScripture() {
      const currentHour = new Date().getHours();
      const suggestionIndex = currentHour % scriptureStudySuggestions.length;

      setScriptureSuggestion(scriptureStudySuggestions[suggestionIndex]);
    }

    // useEffect runs code after React draws the page.
    // This one chooses a Scripture suggestion from the current hour, then checks again each minute.
    chooseHourlyScripture();
    const timerId = window.setInterval(chooseHourlyScripture, 60 * 1000);

    // Returning a cleanup function keeps the interval from running after this component leaves the screen.
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    async function loadTodayDisciplines() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before saving your rhythm.");
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
        setStatusMessage("Log in to save today's rhythm.");
        setStatusTone("neutral");
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      const { data: preferences, error: preferencesError } = await supabase
        .from("rule_of_life_preferences")
        .select("disciplines, practices")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (preferencesError) {
        setStatusMessage("Could not load your rule of life yet. Please refresh and try again.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      const rulePractices = normalizeRuleOfLifePractices(preferences?.practices, preferences?.disciplines);
      const todaysPractices = getTodaysRulePractices(rulePractices);
      const practicesForToday =
        todaysPractices.length > 0
          ? todaysPractices
          : rulePractices.filter((practice) => practice.frequency === "daily");
      const chosenDisciplines = practicesForToday.map((practice) => practice.discipline);

      setDailyPractices(practicesForToday);
      setUpcomingPractices(getUpcomingRulePractices(rulePractices));
      setSelectedDiscipline((current) =>
        chosenDisciplines.includes(current) ? current : chosenDisciplines[0] ?? defaultDailyRhythm[0]
      );

      // Then we load only this user's rows for today's date.
      const { data, error } = await supabase
        .from("disciplines")
        .select("id, name, completed")
        .eq("user_id", currentUser.id)
        .eq("completed_date", getTodayDate());

      if (error) {
        setStatusMessage("Could not load today's rhythm. Please refresh and try again.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      const nextCheckedItems: Record<string, boolean> = {};
      const nextSavedRows: Record<string, DisciplineRow> = {};

      for (const row of data ?? []) {
        if (chosenDisciplines.includes(row.name)) {
          nextCheckedItems[row.name] = row.completed;
          nextSavedRows[row.name] = row;
        }
      }

      setCheckedItems(nextCheckedItems);
      setSavedRows(nextSavedRows);
      setStatusMessage("Today's rhythm loaded.");
      setStatusTone("success");
      setIsLoading(false);
    }

    loadTodayDisciplines();
  }, []);

  async function toggleDiscipline(discipline: string) {
    if (!supabase || !user) {
      setStatusMessage("Log in to save today's rhythm.");
      setStatusTone("neutral");
      return;
    }

    const previousCompleted = checkedItems[discipline] ?? false;
    const nextCompleted = !previousCompleted;

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
        setCheckedItems((currentItems) => ({
          ...currentItems,
          [discipline]: previousCompleted
        }));
        setStatusMessage("Could not save that practice. Please try again.");
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
        setCheckedItems((currentItems) => ({
          ...currentItems,
          [discipline]: previousCompleted
        }));
        setStatusMessage("Could not save that practice. Please try again.");
        setStatusTone("error");
        return;
      }

      setSavedRows((currentRows) => ({
        ...currentRows,
        [discipline]: data
      }));
    }

    setStatusMessage("Saved.");
    setStatusTone("success");
    onSaved?.();
  }

  return (
    <div className="soft-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">Today&apos;s rhythm</h2>
          <p className="mt-1 text-sm text-ink/60">
            {isLoading ? "Loading..." : `${completedCount} practiced today`}
          </p>
        </div>
        {isLoading ? (
          <div className="loading-line h-10 w-24" />
        ) : (
          <Link href="/rule-of-life" className="secondary-button min-h-9 px-3 py-2 text-xs">
            Edit rule
          </Link>
        )}
      </div>

      <div className="mt-5 space-y-2">
        {isLoading
          ? defaultDailyRhythm.slice(0, 4).map((discipline) => (
              <div key={discipline} className="quiet-card flex min-h-14 items-center gap-3">
                <span className="loading-line h-5 w-5 rounded" />
                <span className="loading-line h-4 w-2/3" />
              </div>
            ))
          : visiblePractices.map((practice) => {
          const discipline = practice.discipline;
          const isChecked = checkedItems[discipline] ?? false;
          const isSelected = selectedDiscipline === discipline;

          return (
            <div
              key={discipline}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                isChecked
                  ? "border-moss/25 bg-moss/10 text-ink"
                  : isSelected
                    ? "border-clay/30 bg-parchment text-ink"
                    : "border-ink/10 bg-white/50 text-ink/70 hover:border-clay/30"
              }`}
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleDiscipline(discipline)}
                  disabled={isLoading || !user}
                  className="h-5 w-5 shrink-0 rounded border-ink/20 accent-clay"
                />
                <span className={isChecked ? "font-medium text-moss" : ""}>
                  {discipline}
                </span>
              </label>
              {isChecked ? (
                <span className="hidden rounded-full bg-moss/15 px-2 py-1 text-xs font-semibold text-moss sm:inline-flex">
                  Practiced
                </span>
              ) : null}
              {practicePageSlugs[discipline] ? (
                <Link
                  href={`/disciplines/${practicePageSlugs[discipline]}`}
                  className="hidden rounded-full border border-ink/10 bg-vellum/70 px-3 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-clay/40 hover:text-ink sm:inline-flex"
                >
                  Open
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedDiscipline(discipline)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-clay/40 bg-clay text-vellum"
                    : "border-ink/10 bg-vellum/70 text-ink/60 hover:border-clay/40 hover:text-ink"
                }`}
              >
                Guide
              </button>
            </div>
          );
        })}
      </div>

      {!isLoading && visiblePractices.length === 0 ? (
        <p className="status-note mt-5">
          Nothing is assigned to today. This can be a spacious day, or you can adjust your rule of life.
        </p>
      ) : null}

      {!isLoading && visiblePractices.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-clay/15 bg-parchment/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Direction</p>
              <h3 className="mt-1 font-serif text-2xl text-ink">{selectedDiscipline}</h3>
            </div>
            <Link href="/rule-of-life" className="text-xs font-semibold text-ember underline decoration-clay/40 underline-offset-4">
              Edit rhythm
            </Link>
          </div>

          <p className="mt-3 text-sm leading-6 text-ink/70">{selectedGuidance.description}</p>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            <span className="font-semibold text-ink">Try this today: </span>
            {selectedGuidance.practice}
          </p>
          {selectedPractice?.intention ? (
            <p className="mt-3 text-sm leading-6 text-ink/70">
              <span className="font-semibold text-ink">Your intention: </span>
              {selectedPractice.intention}
            </p>
          ) : null}

          {selectedDiscipline === "Scripture" ? (
            <div className="mt-4 rounded-2xl border border-moss/15 bg-moss/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                  Scripture study suggestion
                </p>
                <span className="rounded-full border border-moss/15 bg-vellum/60 px-2 py-1 text-[11px] font-semibold text-moss">
                  Changes hourly
                </span>
              </div>
              <p className="mt-3 font-serif text-2xl text-ink">{scriptureSuggestion.passage}</p>
              <p className="mt-2 text-sm leading-6 text-ink/70">{scriptureSuggestion.focus}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isLoading && upcomingPractices.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-ink/10 bg-white/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Later in this rhythm</p>
          <div className="mt-3 space-y-2">
            {upcomingPractices.slice(0, 4).map((practice) => (
              <div key={`${practice.discipline}-${practice.frequency}`} className="flex items-start justify-between gap-3 rounded-2xl bg-vellum/70 px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{practice.discipline}</p>
                  <p className="mt-1 text-xs leading-5 text-ink/55">
                    {practice.frequency === "seasonal"
                      ? "Seasonal"
                      : `${frequencyLabels[practice.frequency]}${
                          practice.days.length > 0 ? ` on ${practice.days.join(", ")}` : ""
                        }`}
                  </p>
                </div>
                {practicePageSlugs[practice.discipline] ? (
                  <Link
                    href={`/disciplines/${practicePageSlugs[practice.discipline]}`}
                    className="text-xs font-semibold text-ember underline decoration-clay/40 underline-offset-4"
                  >
                    Open
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
