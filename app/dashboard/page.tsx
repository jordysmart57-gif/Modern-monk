import Link from "next/link";
import DashboardClient from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <main className="page-shell">
      <div className="content-shell">
        <nav className="top-nav">
          <Link href="/" className="font-serif text-2xl text-ink">
            Modern Monk
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/rule-of-life"
              className="rounded-full border border-ink/10 bg-vellum px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-clay transition hover:border-clay/50"
            >
              Setup
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-ink/10 bg-vellum px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-clay transition hover:border-clay/50"
            >
              Account
            </Link>
            <p className="rounded-full border border-ink/10 bg-vellum px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-clay">
              Rule of life
            </p>
          </div>
        </nav>

        <section className="py-7 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">Daily office</p>
          <div className="mt-3 max-w-3xl">
            <div>
              <h1 className="font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">Today&apos;s disciplines</h1>
              <p className="mt-3 max-w-2xl leading-7 text-ink/70">
                Begin small. Mark what you practice, sit in silence, and write one honest note from the day.
              </p>
            </div>
          </div>
        </section>

        <DashboardClient />
      </div>
    </main>
  );
}
