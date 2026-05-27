"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { hasSupabaseConfig, supabase } from "@/src/lib/supabaseClient";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function redirectIfAlreadyLoggedIn() {
      if (!supabase) {
        setIsCheckingSession(false);
        return;
      }

      // Supabase stores the logged-in session in the browser.
      // If it already exists, the user does not need to log in again.
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
        return;
      }

      setIsCheckingSession(false);
    }

    redirectIfAlreadyLoggedIn();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Add your Supabase URL and anon key to .env.local first.");
      return;
    }

    setIsLoading(true);

    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "signup" && !data.session) {
      setMessage("Account created. Check your email to confirm your account, then log in.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="page-shell">
      <div className="absolute inset-0 -z-10 field-paper opacity-60" />
      <div className="mx-auto max-w-5xl">
        <nav className="top-nav">
          <Link href="/" className="font-serif text-2xl text-ink">
            Modern Monk
          </Link>
          <Link href="/" className="pill-link">
            Back home
          </Link>
        </nav>

        <section className="grid gap-8 py-10 md:grid-cols-[0.85fr_1fr] md:items-center sm:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">Account</p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.04] text-ink sm:text-6xl">
              Begin with a quiet sign in.
            </h1>
            <p className="mt-5 max-w-md leading-7 text-ink/70">
              Use email and password for now. Later, this account will connect your disciplines,
              journal entries, and weekly progress to Supabase.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="soft-card shadow-soft">
            {!hasSupabaseConfig ? (
              <div className="error-note mb-5">
                Supabase is not configured yet. Create `.env.local` and add your project values before logging in.
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2 rounded-full bg-parchment p-1">
              {(["login", "signup"] as AuthMode[]).map((authMode) => (
                <button
                  key={authMode}
                  type="button"
                  onClick={() => {
                    setMode(authMode);
                    setMessage("");
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                    mode === authMode ? "bg-ink text-vellum" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  {authMode}
                </button>
              ))}
            </div>

            {isCheckingSession ? (
              <p className="status-note mt-6">
                Checking whether you are already signed in...
              </p>
            ) : null}

            <label htmlFor="email" className="mt-6 block text-sm font-semibold text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="form-field mt-2"
            />

            <label htmlFor="password" className="mt-4 block text-sm font-semibold text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
              className="form-field mt-2"
            />

            <button
              type="submit"
              disabled={isLoading || isCheckingSession || !hasSupabaseConfig}
              className="primary-button mt-6 w-full"
            >
              {isLoading ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
            </button>

            {message ? <p className="error-note mt-4">{message}</p> : null}
          </form>
        </section>
      </div>
    </main>
  );
}
