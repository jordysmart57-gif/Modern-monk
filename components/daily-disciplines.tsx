"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import {
  getLocalEntryDate,
  isPracticeDiscipline,
  loadPracticeEntriesByDateRange,
  type PracticeEntry
} from "@/src/lib/practiceEntries";
import { supabase } from "@/src/lib/supabaseClient";

const practicePageSlugs: Record<string, string> = {
  Prayer: "prayer",
  Silence: "silence",
  Solitude: "solitude",
  Fasting: "fasting",
  Scripture: "scripture",
  Sabbath: "sabbath",
  Journaling: "journaling"
};

function rhythmLabel(practice: RuleOfLifePractice) {
  if (practice.frequency === "daily" || practice.frequency === "seasonal") {
    return frequencyLabels[practice.frequency];
  }

  return `${frequencyLabels[practice.frequency]}${
    practice.days.length > 0 ? ` on ${practice.days.join(", ")}` : ""
  }`;
}

export default function DailyDisciplines() {
  const [todayPractices, setTodayPractices] = useState<RuleOfLifePractice[]>([]);
  const [upcomingPractices, setUpcomingPractices] = useState<RuleOfLifePractice[]>([]);
  const [todayEntries, setTodayEntries] = useState<PracticeEntry[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState(defaultDailyRhythm[0]);
  const [scriptureSuggestion, setScriptureSuggestion] = useState(scriptureStudySuggestions[0]);
  const [statusMessage, setStatusMessage] = useState("Loading today's rhythm...");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const [isLoading, setIsLoading] = useState(true);

  const noticedDisciplines = useMemo(
    () => new Set(todayEntries.map((entry) => entry.discipline)),
    [todayEntries]
  );
  const noticedCount = todayPractices.filter(
    (practice) => isPracticeDiscipline(practice.discipline) && noticedDisciplines.has(practice.discipline)
  ).length;
  const selectedGuidance = disciplineGuidance[selectedDiscipline] ?? disciplineGuidance[defaultDailyRhythm[0]];
  const selectedPractice = todayPractices.find((practice) => practice.discipline === selectedDiscipline);

  useEffect(() => {
    function chooseHourlyScripture() {
      const currentHour = new Date().getHours();
      const suggestionIndex = currentHour % scriptureStudySuggestions.length;

      setScriptureSuggestion(scriptureStudySuggestions[suggestionIndex]);
    }

    chooseHourlyScripture();
    const timerId = window.setInterval(chooseHourlyScripture, 60 * 1000);

    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    async function loadTodaysRhythm() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before loading your rhythm.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatusMessage("Log in to see today's rhythm.");
        setStatusTone("neutral");
        setIsLoading(false);
        return;
      }

      const { data: preferences, error: preferencesError } = await supabase
        .from("rule_of_life_preferences")
        .select("disciplines, practices")
        .eq("user_id", user.id)
        .maybeSingle();

      if (preferencesError) {
        setStatusMessage("Could not load your rule of life yet. Please refresh and try again.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      const rulePractices = normalizeRuleOfLifePractices(preferences?.practices, preferences?.disciplines);
      const todaysRulePractices = getTodaysRulePractices(rulePractices);
      const practicesForToday =
        todaysRulePractices.length > 0
          ? todaysRulePractices
          : rulePractices.filter((practice) => practice.frequency === "daily");
      const today = getLocalEntryDate();
      const { entries, error: entriesError } = await loadPracticeEntriesByDateRange(today, today);

      if (entriesError && !entriesError.includes("Log in")) {
        setStatusMessage(entriesError);
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      setTodayPractices(practicesForToday);
      setUpcomingPractices(getUpcomingRulePractices(rulePractices));
      setTodayEntries(entries);
      setSelectedDiscipline((current) => {
        const todayDisciplines = practicesForToday.map((practice) => practice.discipline);

        return todayDisciplines.includes(current) ? current : todayDisciplines[0] ?? defaultDailyRhythm[0];
      });
      setStatusMessage("Today's rhythm loaded.");
      setStatusTone("success");
      setIsLoading(false);
    }

    loadTodaysRhythm();
  }, []);

  return (
    <div className="soft-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-ink">Today&apos;s rhythm</h2>
          <p className="mt-1 text-sm text-ink/60">
            {isLoading ? "Loading..." : `${noticedCount} noticings saved today`}
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
          : todayPractices.map((practice) => {
              const noticedToday =
                isPracticeDiscipline(practice.discipline) && noticedDisciplines.has(practice.discipline);
              const isSelected = selectedDiscipline === practice.discipline;
              const slug = practicePageSlugs[practice.discipline];

              return (
                <article
                  key={practice.discipline}
                  className={`rounded-2xl border px-4 py-4 transition ${
                    noticedToday
                      ? "border-moss/25 bg-moss/10 text-ink"
                      : isSelected
                        ? "border-clay/30 bg-parchment text-ink"
                        : "border-ink/10 bg-white/50 text-ink/75 hover:border-clay/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDiscipline(practice.discipline)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="font-serif text-2xl text-ink">{practice.discipline}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-clay">
                        {rhythmLabel(practice)}
                      </p>
                    </button>
                    {noticedToday ? (
                      <span className="rounded-full bg-moss/15 px-2 py-1 text-xs font-semibold text-moss">
                        Noticed today
                      </span>
                    ) : null}
                  </div>

                  {practice.intention ? (
                    <p className="mt-3 text-sm leading-6 text-ink/65">{practice.intention}</p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {slug ? (
                      <Link href={`/disciplines/${slug}`} className="primary-button min-h-10 px-4 py-2 text-xs">
                        Open practice
                      </Link>
                    ) : (
                      <span className="rounded-full border border-ink/10 bg-vellum/70 px-3 py-2 text-xs font-semibold text-ink/55">
                        Guided page coming later
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedDiscipline(practice.discipline)}
                      className="secondary-button min-h-10 px-4 py-2 text-xs"
                    >
                      Direction
                    </button>
                  </div>
                </article>
              );
            })}
      </div>

      {!isLoading && todayPractices.length === 0 ? (
        <p className="status-note mt-5">
          Nothing is assigned to today. This can be a spacious day, or you can adjust your rule of life.
        </p>
      ) : null}

      {!isLoading && todayPractices.length > 0 ? (
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

      {!isLoading && todayEntries.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-ink/10 bg-white/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Noticed today</p>
          <div className="mt-3 space-y-2">
            {todayEntries.slice(0, 3).map((entry) => (
              <article key={entry.id} className="rounded-2xl bg-vellum/70 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">{entry.discipline}</p>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/65">{entry.notes}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {!isLoading && upcomingPractices.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-ink/10 bg-white/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Later in this rhythm</p>
          <div className="mt-3 space-y-2">
            {upcomingPractices.slice(0, 4).map((practice) => (
              <div
                key={`${practice.discipline}-${practice.frequency}`}
                className="flex items-start justify-between gap-3 rounded-2xl bg-vellum/70 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{practice.discipline}</p>
                  <p className="mt-1 text-xs leading-5 text-ink/55">{rhythmLabel(practice)}</p>
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
        {statusMessage.includes("Log in") ? (
          <span>
            {statusMessage}{" "}
            <Link href="/login" className="font-semibold text-ember underline decoration-clay/40 underline-offset-4">
              Go to login
            </Link>
          </span>
        ) : (
          <span>{statusMessage}</span>
        )}
      </div>
    </div>
  );
}
