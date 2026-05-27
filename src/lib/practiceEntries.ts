import { supabase } from "@/src/lib/supabaseClient";

export type PracticeDiscipline =
  | "Prayer"
  | "Silence"
  | "Solitude"
  | "Fasting"
  | "Scripture"
  | "Sabbath"
  | "Journaling";

export type PracticeEntry = {
  id: string;
  user_id: string;
  discipline: PracticeDiscipline;
  entry_date: string;
  notes: string;
  created_at: string;
};

export type SavePracticeEntryInput = {
  discipline: PracticeDiscipline;
  notes: string;
};

export function getLocalEntryDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function savePracticeEntry({ discipline, notes }: SavePracticeEntryInput) {
  if (!supabase) {
    return {
      entry: null,
      error: "Supabase is not configured yet."
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      entry: null,
      error: "Log in before saving this noticing."
    };
  }

  const trimmedNotes = notes.trim();

  if (!trimmedNotes) {
    return {
      entry: null,
      error: "Write one sentence about what you noticed before saving."
    };
  }

  const { data, error } = await supabase
    .from("practice_entries")
    .insert({
      user_id: user.id,
      discipline,
      entry_date: getLocalEntryDate(),
      notes: trimmedNotes
    })
    .select("id, user_id, discipline, entry_date, notes, created_at")
    .single();

  if (error) {
    return {
      entry: null,
      error: "Could not save this noticing. Please try again."
    };
  }

  return {
    entry: data as PracticeEntry,
    error: null
  };
}

export async function loadRecentPracticeEntries(limit = 5) {
  if (!supabase) {
    return {
      entries: [],
      error: "Supabase is not configured yet."
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      entries: [],
      error: "Log in to see saved noticings."
    };
  }

  const { data, error } = await supabase
    .from("practice_entries")
    .select("id, user_id, discipline, entry_date, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      entries: [],
      error: "Could not load saved noticings."
    };
  }

  return {
    entries: (data ?? []) as PracticeEntry[],
    error: null
  };
}
