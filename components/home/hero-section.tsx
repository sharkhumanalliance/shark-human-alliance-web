export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-[var(--brand-dark)] shadow-sm">
            Officially fictional. Socially important.
          </div>

          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-6xl">
            Sharks deserve better PR.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            A fictional alliance helping humans and sharks build better relations
            — through friendship, diplomacy, and significantly reduced human
            snacking.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/membership"
              className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              Join the Alliance
            </a>

            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
            >
              Learn the mission
            </a>
          </div>

          <p className="mt-5 text-sm text-[var(--muted)]">
            Includes a personalized certificate. Entirely symbolic. Deeply
            appreciated by sharks.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute -right-10 bottom-6 h-36 w-36 rounded-full bg-sky-300/30 blur-3xl" />

          <div className="relative rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(25,87,138,0.12)] backdrop-blur">
            <div className="mb-5 inline-flex items-center rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-800">
              Founding ambassadors
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand)] text-xl font-semibold text-white shadow-lg shadow-sky-200/70">
                  FM
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--brand-dark)]">
                  Finnley Mako
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Cheerful spokesperson of improved shark-human relations.
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Optimistic • Diplomatic • Shark
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-cyan-100 bg-gradient-to-b from-cyan-50 to-white p-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500 text-xl font-semibold text-white shadow-lg shadow-cyan-200/70">
                  LR
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--brand-dark)]">
                  Luna Reef
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Calm co-founder focused on harmony, trust and future shark families.
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Warm • Thoughtful • Shark
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.75rem] border border-sky-100 bg-[var(--surface-soft)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-800">
                Membership preview
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--brand-dark)]">
                Protected Friend Status
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Personalized certificate, alliance recognition, and a noticeable
                improvement in cross-species vibes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}