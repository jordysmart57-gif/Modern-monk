"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createPracticeFromDiscipline,
  frequencyDescriptions,
  frequencyLabels,
  normalizeRuleOfLifePractices,
  ruleOfLifeDisciplines,
  weekDays,
  type RuleFrequency,
  type RuleOfLifePractice,
  type WeekDay
} from "@/src/lib/ruleOfLife";
import { supabase } from "@/src/lib/supabaseClient";

const frequencyOptions: RuleFrequency[] = ["daily", "weekly", "monthly", "seasonal"];

function practiceSummary(practice: RuleOfLifePractice) {
  if (practice.frequency === "daily") {
    return "Daily";
  }

  if (practice.frequency === "seasonal") {
    return "Seasonal";
  }

  return `${frequencyLabels[practice.frequency]}${
    practice.days.length > 0 ? ` on ${practice.days.join(", ")}` : ""
  }`;
}

export default function RuleOfLifePage() {
  const [practices, setPractices] = useState<RuleOfLifePractice[]>([]);
  const [statusMessage, setStatusMessage] = useState("Loading your rule of life...");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const dailyCount = useMemo(
    () => practices.filter((practice) => practice.frequency === "daily").length,
    [practices]
  );
  const spaciousCount = practices.length - dailyCount;

  useEffect(() => {
    async function loadPreferences() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before saving your rule of life.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setStatusMessage("Log in to set up your rule of life.");
        setStatusTone("neutral");
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("rule_of_life_preferences")
        .select("disciplines, practices")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setStatusMessage("Could not load your rule of life. Please refresh and try again.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      setPractices(normalizeRuleOfLifePractices(data?.practices, data?.disciplines));
      setStatusMessage("Choose the rhythms that fit this season.");
      setStatusTone("neutral");
      setIsLoading(false);
    }

    loadPreferences();
  }, []);

  function isSelected(discipline: string) {
    return practices.some((practice) => practice.discipline === discipline);
  }

  function togglePractice(discipline: string) {
    setStatusMessage("Choose the rhythms that fit this season.");
    setStatusTone("neutral");

    setPractices((current) =>
      current.some((practice) => practice.discipline === discipline)
        ? current.filter((practice) => practice.discipline !== discipline)
        : [...current, createPracticeFromDiscipline(discipline)]
    );
  }

  function updatePractice(discipline: string, nextValues: Partial<RuleOfLifePractice>) {
    setStatusMessage("Choose the rhythms that fit this season.");
    setStatusTone("neutral");

    setPractices((current) =>
      current.map((practice) => {
        if (practice.discipline !== discipline) {
          return practice;
        }

        const nextFrequency = nextValues.frequency ?? practice.frequency;
        const nextDays =
          nextValues.days ??
          (nextFrequency === "daily" || nextFrequency === "seasonal" ? [] : practice.days);

        return {
          ...practice,
          ...nextValues,
          days: nextDays
        };
      })
    );
  }

  function toggleDay(discipline: string, day: WeekDay) {
    const practice = practices.find((item) => item.discipline === discipline);

    if (!practice) {
      return;
    }

    updatePractice(discipline, {
      days: practice.days.includes(day)
        ? practice.days.filter((item) => item !== day)
        : [...practice.days, day]
    });
  }

  async function savePreferences() {
    if (!supabase || !userId) {
      setStatusMessage("Log in before saving your rule of life.");
      setStatusTone("error");
      return;
    }

    if (practices.length === 0) {
      setStatusMessage("Choose at least one practice for this season.");
      setStatusTone("error");
      return;
    }

    setIsSaving(true);
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    const { error } = await supabase.from("rule_of_life_preferences").upsert({
      user_id: userId,
      disciplines: practices.map((practice) => practice.discipline),
      practices,
      updated_at: new Date().toISOString()
    });

    setIsSaving(false);

    if (error) {
      setStatusMessage("Could not save your rule of life. Please try again.");
      setStatusTone("error");
      return;
    }

    setStatusMessage("Rule of life saved.");
    setStatusTone("success");
  }

  return (
    <main className="page-shell">
      <div className="absolute inset-0 -z-10 field-paper opacity-60" />
      <div className="content-shell">
        <nav className="top-nav">
          <Link href="/" className="font-serif text-2xl text-ink">
            Modern Monk
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard" className="pill-link">
              Dashboard
            </Link>
            <Link href="/login" className="pill-link">
              Account
            </Link>
          </div>
        </nav>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.72fr_1fr] lg:items-start sm:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">Rule of life</p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.04] text-ink sm:text-6xl">
              Shape a rhythm for this season.
            </h1>
            <p className="mt-5 max-w-md leading-7 text-ink/70">
              Not every practice belongs every day. Let prayer and Scripture be anchors, and give fasting,
              Sabbath, solitude, and service the kind of space they actually need.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="quiet-card">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Daily anchors</p>
                <p className="mt-2 font-serif text-3xl text-ink">{dailyCount}</p>
              </div>
              <div className="quiet-card">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Spacious rhythms</p>
                <p className="mt-2 font-serif text-3xl text-ink">{spaciousCount}</p>
              </div>
            </div>
          </div>

          <div className="soft-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl text-ink">Builder</h2>
                <p className="mt-1 text-sm text-ink/60">
                  {isLoading ? "Loading..." : `${practices.length} practices in this season`}
                </p>
              </div>
              <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                Gentle
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {isLoading
                ? ruleOfLifeDisciplines.slice(0, 5).map((discipline) => (
                    <div key={discipline} className="quiet-card flex min-h-20 items-center gap-3">
                      <span className="loading-line h-5 w-5 rounded" />
                      <span className="loading-line h-4 w-2/3" />
                    </div>
                  ))
                : ruleOfLifeDisciplines.map((discipline) => {
                    const selected = isSelected(discipline);
                    const practice = practices.find((item) => item.discipline === discipline);

                    return (
                      <article
                        key={discipline}
                        className={`rounded-2xl border p-4 transition ${
                          selected
                            ? "border-moss/25 bg-moss/10"
                            : "border-ink/10 bg-white/50 text-ink/70"
                        }`}
                      >
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => togglePractice(discipline)}
                            className="h-5 w-5 rounded border-ink/20 accent-clay"
                          />
                          <span className="font-serif text-2xl text-ink">{discipline}</span>
                          {practice ? (
                            <span className="ml-auto hidden rounded-full bg-vellum px-3 py-1 text-xs font-semibold text-moss sm:inline-flex">
                              {practiceSummary(practice)}
                            </span>
                          ) : null}
                        </label>

                        {practice ? (
                          <div className="mt-4 space-y-4 border-t border-ink/10 pt-4">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                              {frequencyOptions.map((frequency) => (
                                <button
                                  key={frequency}
                                  type="button"
                                  onClick={() =>
                                    updatePractice(discipline, {
                                      frequency,
                                      days:
                                        frequency === "weekly" || frequency === "monthly"
                                          ? practice.days.length > 0
                                            ? practice.days
                                            : ["Sunday"]
                                          : []
                                    })
                                  }
                                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                                    practice.frequency === frequency
                                      ? "border-clay bg-clay text-vellum"
                                      : "border-ink/10 bg-white/50 text-ink/60 hover:border-clay/40"
                                  }`}
                                >
                                  {frequencyLabels[frequency]}
                                </button>
                              ))}
                            </div>

                            <p className="text-sm leading-6 text-ink/60">
                              {frequencyDescriptions[practice.frequency]}
                            </p>

                            {(practice.frequency === "weekly" || practice.frequency === "monthly") ? (
                              <div className="flex flex-wrap gap-2">
                                {weekDays.map((day) => (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(discipline, day)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                      practice.days.includes(day)
                                        ? "border-moss/30 bg-moss text-vellum"
                                        : "border-ink/10 bg-vellum/70 text-ink/60 hover:border-moss/30"
                                    }`}
                                  >
                                    {day.slice(0, 3)}
                                  </button>
                                ))}
                              </div>
                            ) : null}

                            <label className="block">
                              <span className="text-sm font-semibold text-ink">Gentle intention</span>
                              <textarea
                                value={practice.intention}
                                onChange={(event) =>
                                  updatePractice(discipline, {
                                    intention: event.target.value
                                  })
                                }
                                className="form-field mt-2 min-h-20 resize-none leading-7"
                              />
                            </label>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={savePreferences}
                disabled={isLoading || isSaving || !userId}
                className="primary-button"
              >
                {isSaving ? "Saving..." : "Save Rule"}
              </button>
              <Link href="/dashboard" className="secondary-button">
                Back to dashboard
              </Link>
            </div>

            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
                statusTone === "error"
                  ? "border border-ember/20 bg-ember/5 text-ember"
                  : statusTone === "success"
                    ? "border border-moss/15 bg-moss/10 text-moss"
                    : "border border-ink/10 bg-white/40 text-ink/60"
              }`}
            >
              {statusMessage}{" "}
              {!userId && !isLoading ? (
                <Link href="/login" className="font-semibold text-ember underline decoration-clay/40 underline-offset-4">
                  Go to login
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
