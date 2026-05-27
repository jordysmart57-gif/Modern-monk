import Link from "next/link";
import { notFound } from "next/navigation";
import PracticeShell from "@/components/practices/PracticeShell";
import SilenceTimerPractice from "@/components/practices/SilenceTimerPractice";
import type { PracticeDiscipline } from "@/src/lib/practiceEntries";

const practicePages: Record<
  string,
  {
    discipline: PracticeDiscipline;
    description: string;
  }
> = {
  prayer: {
    discipline: "Prayer",
    description: "A breath prayer will live here: a short phrase carried gently with inhale and exhale."
  },
  silence: {
    discipline: "Silence",
    description: "A minimal timer for stillness before God, ending with one simple question instead of a score."
  },
  solitude: {
    discipline: "Solitude",
    description: "A step-away practice will live here: leave something behind, return with one sentence."
  },
  fasting: {
    discipline: "Fasting",
    description: "A food fast practice will live here, with space to notice hunger and pray without performance."
  },
  scripture: {
    discipline: "Scripture",
    description: "A lectio divina walk-through will live here: Read, Meditate, Pray, and Contemplate."
  },
  sabbath: {
    discipline: "Sabbath",
    description: "A Sabbath frame will live here: laying down, delight, and a closing blessing."
  },
  journaling: {
    discipline: "Journaling",
    description: "An examen practice will live here, with space for presence, resistance, and free writing."
  }
};

type DisciplinePracticePageProps = {
  params: Promise<{
    name: string;
  }>;
};

export function generateStaticParams() {
  return Object.keys(practicePages).map((name) => ({ name }));
}

export default async function DisciplinePracticePage({ params }: DisciplinePracticePageProps) {
  const { name } = await params;
  const practice = practicePages[name.toLowerCase()];

  if (!practice) {
    notFound();
  }

  return (
    <PracticeShell discipline={practice.discipline} description={practice.description}>
      {practice.discipline === "Silence" ? (
        <SilenceTimerPractice />
      ) : (
        <div className="soft-card max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-clay">Coming next</p>
          <h2 className="mt-3 font-serif text-3xl text-ink">{practice.discipline} practice</h2>
          <p className="mt-3 leading-7 text-ink/70">
            This page is wired into the new practice pattern. We are using Silence first as the reference,
            then we will build this interaction with the same quiet saving flow.
          </p>
          <Link href="/disciplines/silence" className="secondary-button mt-5">
            View Silence reference
          </Link>
        </div>
      )}
    </PracticeShell>
  );
}
