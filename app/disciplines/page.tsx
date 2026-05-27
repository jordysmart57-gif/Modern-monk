import Link from "next/link";

const disciplines = [
  {
    name: "Prayer",
    note: "Prayer is regular conversation with God. In Modern Monk, it starts small: a few honest minutes of attention, asking, listening, confession, and trust."
  },
  {
    name: "Silence",
    note: "Silence is the practice of becoming still before God without needing to fill the space. It helps the heart slow down enough to notice what is true."
  },
  {
    name: "Solitude",
    note: "Solitude is stepping away from noise and performance for a little while. It is not isolation; it is a quiet place to be with God as you are."
  },
  {
    name: "Fasting",
    note: "Fasting is temporarily setting aside a good thing, often food, to remember that God is our deepest need. For beginners, it can be simple and gentle."
  },
  {
    name: "Scripture",
    note: "Scripture is slow attention to the Bible. The goal is not to rush through chapters, but to receive wisdom, correction, comfort, and formation."
  },
  {
    name: "Sabbath",
    note: "Sabbath is a rhythm of rest and delight. It reminds us we are beloved before we are productive, and that God holds the world while we stop."
  },
  {
    name: "Journaling",
    note: "Journaling gives language to the inner life. A short reflection can help you notice grace, name resistance, and remember what God is teaching you."
  }
];

export default function DisciplinesPage() {
  return (
    <main className="page-shell">
      <div className="absolute inset-0 -z-10 field-paper opacity-60" />
      <div className="content-shell">
        <nav className="top-nav">
          <Link href="/" className="font-serif text-2xl text-ink">
            Modern Monk
          </Link>
          <Link href="/dashboard" className="pill-link">
            Open dashboard
          </Link>
        </nav>

        <section className="py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-clay">The disciplines</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <h1 className="font-serif text-4xl leading-[1.04] text-ink sm:text-6xl">
              Seven quiet practices for ordinary faithfulness.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-ink/70">
              These are not points to earn. They are small, repeatable practices that help make room for God in
              everyday life.
            </p>
          </div>
        </section>

        <section className="grid gap-4 pb-16 md:grid-cols-2">
          {disciplines.map((discipline, index) => (
            <article key={discipline.name} className="soft-card">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay/25 bg-parchment font-serif text-lg text-ember">
                  {index + 1}
                </span>
                <div>
                  <h2 className="font-serif text-3xl text-ink">{discipline.name}</h2>
                  <p className="mt-3 leading-7 text-ink/70">{discipline.note}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
