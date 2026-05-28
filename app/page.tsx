import Link from "next/link";

const disciplines = ["Prayer", "Silence", "Solitude", "Fasting", "Scripture", "Sabbath", "Journaling"];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative px-4 py-4 sm:px-6 lg:px-10">
        <div className="absolute inset-0 -z-10 field-paper opacity-70" />
        <nav className="top-nav content-shell">
          <Link href="/" className="font-serif text-2xl tracking-normal text-ink">
            Modern Monk
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/login" className="pill-link">
              Log in
            </Link>
            <Link href="/dashboard" className="pill-link">
              Dashboard
            </Link>
          </div>
        </nav>

        <div className="content-shell grid gap-8 pb-12 pt-12 md:grid-cols-[1.08fr_0.92fr] md:items-center lg:gap-12 lg:pt-20">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-clay">
              Field notes for the soul
            </p>
            <h1 className="max-w-3xl font-serif text-4xl leading-[1.02] text-ink sm:text-6xl lg:text-7xl">
              Keep a quiet rule of life in the middle of ordinary days.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
              Modern Monk helps Christians practice prayer, silence, Scripture, fasting, Sabbath, and reflection
              with a simple daily rhythm instead of another noisy productivity system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="primary-button">
                Start today
              </Link>
              <Link href="/disciplines" className="secondary-button">
                See disciplines
              </Link>
            </div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden rounded-2xl border border-ink/10 bg-vellum shadow-soft sm:min-h-[430px]">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-wheat/30 to-transparent" />
            <div className="absolute inset-8 rounded-[1.5rem] border border-clay/15" />
            <div className="absolute left-9 top-9 h-12 w-12 rounded-full border border-clay/30" />
            <div className="absolute right-8 top-10 h-28 w-28 rounded-full border border-moss/25" />
            <div className="absolute bottom-0 left-0 right-0 h-36 liturgical-rule opacity-70" />
            <div className="relative flex h-full min-h-[390px] flex-col justify-between p-6 sm:min-h-[430px] sm:p-8">
              <div className="ml-auto w-fit rounded-full border border-moss/20 bg-parchment px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-moss">
                Vespers
              </div>
              <div>
                <p className="font-serif text-3xl leading-tight text-ink sm:text-4xl">Today&apos;s rule</p>
                <div className="mt-6 space-y-3">
                  {disciplines.slice(0, 5).map((discipline, index) => (
                    <div key={discipline} className="quiet-card flex items-center gap-3 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-clay/25 text-xs text-clay">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-ink/80">{discipline}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 sm:px-6 lg:px-10">
        <div className="content-shell grid gap-4 md:grid-cols-3">
          {[
            ["Daily", "A gentle rhythm for faithful repetition."],
            ["Quiet", "A silence timer for stillness before God."],
            ["Reflective", "A journal space for noticing grace."],
          ].map(([title, copy]) => (
            <div key={title} className="soft-card">
              <p className="font-serif text-2xl text-ink">{title}</p>
              <p className="mt-3 leading-7 text-ink/70">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
