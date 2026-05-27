"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultDailyRhythm, ruleOfLifeDisciplines } from "@/src/lib/ruleOfLife";
import { supabase } from "@/src/lib/supabaseClient";

export default function RuleOfLifePage() {
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(defaultDailyRhythm);
  const [statusMessage, setStatusMessage] = useState("Loading your rule of life...");
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "error">("neutral");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      if (!supabase) {
        setStatusMessage("Add Supabase keys before saving your rule of life.");
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      // Supabase tells us who is logged in so preferences belong to one user.
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

      // This loads the user's saved list of chosen disciplines if one exists.
      const { data, error } = await supabase
        .from("rule_of_life_preferences")
        .select("disciplines")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setStatusMessage(error.message);
        setStatusTone("error");
        setIsLoading(false);
        return;
      }

      if (data?.disciplines?.length) {
        setSelectedDisciplines(data.disciplines);
      }

      setStatusMessage("Choose the practices for your ordinary daily rhythm.");
      setStatusTone("neutral");
      setIsLoading(false);
    }

    loadPreferences();
  }, []);

  function toggleDiscipline(discipline: string) {
    setStatusMessage("Choose the practices for your ordinary daily rhythm.");
    setStatusTone("neutral");
    setSelectedDisciplines((current) =>
      current.includes(discipline)
        ? current.filter((item) => item !== discipline)
        : [...current, discipline]
    );
  }

  async function savePreferences() {
    if (!supabase || !userId) {
      setStatusMessage("Log in before saving your rule of life.");
      setStatusTone("error");
      return;
    }

    if (selectedDisciplines.length === 0) {
      setStatusMessage("Choose at least one discipline for your daily rhythm.");
      setStatusTone("error");
      return;
    }

    setIsSaving(true);
    setStatusMessage("Saving...");
    setStatusTone("neutral");

    // Upsert means: insert this row if it is new, or update it if it already exists.
    const { error } = await supabase.from("rule_of_life_preferences").upsert({
      user_id: userId,
      disciplines: selectedDisciplines,
      updated_at: new Date().toISOString()
    });

    setIsSaving(false);

    if (error) {
      setStatusMessage(error.message);
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

        <section className="grid gap-6 py-10 lg:grid-cols-[0.78fr_1fr] lg:items-start sm:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">Rule of life</p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.04] text-ink sm:text-6xl">
              Choose your daily rhythm.
            </h1>
            <p className="mt-5 max-w-md leading-7 text-ink/70">
              Start small. Pick the practices that fit the season you are actually in, not the one you wish
              you were in.
            </p>
          </div>

          <div className="soft-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl text-ink">Daily practices</h2>
                <p className="mt-1 text-sm text-ink/60">
                  {isLoading ? "Loading..." : `${selectedDisciplines.length} selected`}
                </p>
              </div>
              <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
                Setup
              </span>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {isLoading
                ? ruleOfLifeDisciplines.slice(0, 6).map((discipline) => (
                    <div key={discipline} className="quiet-card flex min-h-14 items-center gap-3">
                      <span className="loading-line h-5 w-5 rounded" />
                      <span className="loading-line h-4 w-2/3" />
                    </div>
                  ))
                : ruleOfLifeDisciplines.map((discipline) => {
                    const isSelected = selectedDisciplines.includes(discipline);

                    return (
                      <label
                        key={discipline}
                        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                          isSelected
                            ? "border-moss/25 bg-moss/10 text-ink"
                            : "border-ink/10 bg-white/50 text-ink/70 hover:border-clay/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDiscipline(discipline)}
                          className="h-5 w-5 rounded border-ink/20 accent-clay"
                        />
                        <span className={isSelected ? "font-semibold" : ""}>{discipline}</span>
                      </label>
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
                {isSaving ? "Saving..." : "Save Preferences"}
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
