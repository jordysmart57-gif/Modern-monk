import Link from "next/link";
import type { ReactNode } from "react";
import type { PracticeDiscipline } from "@/src/lib/practiceEntries";

type PracticeShellProps = {
  discipline: PracticeDiscipline;
  description: string;
  children: ReactNode;
};

export default function PracticeShell({ discipline, description, children }: PracticeShellProps) {
  return (
    <main className="page-shell">
      <div className="absolute inset-0 -z-10 field-paper opacity-60" />
      <div className="content-shell">
        <nav className="top-nav">
          <Link href="/" className="font-serif text-2xl text-ink">
            Modern Monk
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/disciplines" className="pill-link">
              Disciplines
            </Link>
            <Link href="/dashboard" className="pill-link">
              Dashboard
            </Link>
          </div>
        </nav>

        <section className="py-9 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">Practice</p>
          <h1 className="mt-4 font-serif text-5xl leading-none text-ink sm:text-6xl">{discipline}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
            {description}
          </p>
        </section>

        <section className="pb-14">{children}</section>
      </div>
    </main>
  );
}
