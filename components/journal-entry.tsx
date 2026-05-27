"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/src/lib/supabaseClient";

type JournalEntryRow = {
  id: string;
  content: string;
  entry_date: string;
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function JournalEntry() {
  const [entry, setEntry] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeTone, setNoticeTone] = useState<"neutral" | "success" | "error">("neutral");
  const [user, setUser] = useState<User | null>(null);
  const [existingEntry, setExistingEntry] = useState<JournalEntryRow | null>(null);
  const [pastEntries, setPastEntries] = useState<JournalEntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadJournalEntries() {
      if (!supabase) {
        setErrorMessage("Add Supabase keys before saving reflections.");
        setNoticeTone("error");
        setIsLoading(false);
        return;
      }

      // Supabase auth tells us which user is logged in on this browser.
      // We use that user's id so each person only sees their own journal entry.
      const {
        data: { user: currentUser },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        setErrorMessage("Log in to save and load today's reflection.");
        setNoticeTone("neutral");
        setIsLoading(false);
        return;
      }

      setUser(currentUser);

      // This loads today's journal entry from Supabase if the user already saved one.
      const { data: todayEntry, error: todayError } = await supabase
        .from("journal_entries")
        .select("id, content, entry_date")
        .eq("user_id", currentUser.id)
        .eq("entry_date", getTodayDate())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (todayError) {
        setErrorMessage(todayError.message);
        setNoticeTone("error");
        setIsLoading(false);
        return;
      }

      if (todayEntry) {
        setEntry(todayEntry.content);
        setExistingEntry(todayEntry);
        setSaveMessage("Today's reflection loaded.");
        setNoticeTone("success");
      }

      await loadPastEntries(currentUser.id);
      setIsLoading(false);
    }

    loadJournalEntries();
  }, []);

  async function loadPastEntries(userId: string) {
    if (!supabase) {
      return;
    }

    // This asks Supabase for older reflections for this same user.
    // We skip today's entry because it is already shown in the textarea above.
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, content, entry_date")
      .eq("user_id", userId)
      .lt("entry_date", getTodayDate())
      .order("entry_date", { ascending: false })
      .limit(5);

    if (error) {
      setErrorMessage(error.message);
      setNoticeTone("error");
      return;
    }

    setPastEntries(data ?? []);
  }

  async function saveReflection() {
    setSaveMessage("");
    setErrorMessage("");
    setNoticeTone("neutral");

    if (!supabase || !user) {
      setErrorMessage("Log in before saving your reflection.");
      setNoticeTone("neutral");
      return;
    }

    const trimmedEntry = entry.trim();

    if (!trimmedEntry) {
      setErrorMessage("Write a reflection before saving.");
      setNoticeTone("error");
      return;
    }

    setIsSaving(true);

    if (existingEntry) {
      const { error } = await supabase
        .from("journal_entries")
        .update({ content: trimmedEntry })
        .eq("id", existingEntry.id);

      setIsSaving(false);

      if (error) {
        setErrorMessage(error.message);
        setNoticeTone("error");
        return;
      }
      setExistingEntry({ ...existingEntry, content: trimmedEntry });
    } else {
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          content: trimmedEntry,
          entry_date: getTodayDate()
        })
        .select("id, content, entry_date")
        .single();

      setIsSaving(false);

      if (error) {
        setErrorMessage(error.message);
        setNoticeTone("error");
        return;
      }

      setExistingEntry(data);
    }

    setEntry(trimmedEntry);
    setSaveMessage("Reflection saved to Supabase.");
    setNoticeTone("success");
    await loadPastEntries(user.id);
  }

  return (
    <div className="soft-card">
      <div>
        <h2 className="font-serif text-3xl text-ink">Journal</h2>
        <label htmlFor="journal-entry" className="mt-1 block text-sm text-ink/60">
          Where did you notice God today?
        </label>
      </div>

      <textarea
        id="journal-entry"
        value={entry}
        disabled={isLoading || !user}
        onChange={(event) => {
          setEntry(event.target.value);
          setSaveMessage("");
          setErrorMessage("");
          setNoticeTone("neutral");
        }}
        placeholder={isLoading ? "Loading today's reflection..." : "Write a few honest lines..."}
        className="form-field mt-5 min-h-44 resize-none leading-7"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={saveReflection}
          disabled={isLoading || isSaving || !user}
          className="primary-button"
        >
          {isSaving ? "Saving..." : "Save Reflection"}
        </button>
        <p className="text-xs leading-5 text-ink/50">{isLoading ? "Loading..." : `${entry.length} characters`}</p>
      </div>

      {saveMessage || errorMessage ? (
        <div
          className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${
            noticeTone === "error"
              ? "border border-ember/20 bg-ember/5 text-ember"
              : noticeTone === "success"
                ? "border border-moss/15 bg-moss/10 text-moss"
                : "border border-ink/10 bg-white/40 text-ink/60"
          }`}
        >
          {errorMessage || saveMessage}{" "}
          {errorMessage && !user ? (
            <Link href="/login" className="font-semibold underline decoration-clay/40 underline-offset-4">
              Go to login
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 border-t border-ink/10 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-ink">Past reflections</h3>
            <p className="mt-1 text-sm text-ink/50">Recent saved journal entries.</p>
          </div>
          <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold text-moss">
            {pastEntries.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1].map((item) => (
                <div key={item} className="quiet-card space-y-3">
                  <div className="loading-line h-3 w-24" />
                  <div className="loading-line h-4 w-full" />
                  <div className="loading-line h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : pastEntries.length > 0 ? (
            pastEntries.map((pastEntry) => (
              <article key={pastEntry.id} className="quiet-card">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">
                  {pastEntry.entry_date}
                </p>
                <p className="mt-2 line-clamp-4 leading-7 text-ink/70">{pastEntry.content}</p>
              </article>
            ))
          ) : (
            <p className="status-note">
              No past reflections yet. Once you save on another day, they will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
