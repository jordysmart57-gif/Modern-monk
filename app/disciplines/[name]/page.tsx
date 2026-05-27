import { notFound } from "next/navigation";
import BreathPrayer from "@/components/practices/BreathPrayer";
import Examen from "@/components/practices/Examen";
import FastTimer from "@/components/practices/FastTimer";
import LectioDivina from "@/components/practices/LectioDivina";
import PracticeShell from "@/components/practices/PracticeShell";
import SabbathFrame from "@/components/practices/SabbathFrame";
import SilenceTimerPractice from "@/components/practices/SilenceTimerPractice";
import StepAway from "@/components/practices/StepAway";
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
      {practice.discipline === "Prayer" ? <BreathPrayer /> : null}
      {practice.discipline === "Silence" ? <SilenceTimerPractice /> : null}
      {practice.discipline === "Solitude" ? <StepAway /> : null}
      {practice.discipline === "Fasting" ? <FastTimer /> : null}
      {practice.discipline === "Scripture" ? <LectioDivina /> : null}
      {practice.discipline === "Sabbath" ? <SabbathFrame /> : null}
      {practice.discipline === "Journaling" ? <Examen /> : null}
    </PracticeShell>
  );
}
