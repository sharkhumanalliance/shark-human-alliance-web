import { HeroSection } from "@/components/home/hero-section";
import { MembershipCard } from "@/components/home/membership-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const howItWorks = [
  {
    step: "01",
    title: "Pick your certificate",
    text: "Choose from three levels of symbolic shark diplomacy — each one funnier and more official-looking than the last.",
  },
  {
    step: "02",
    title: "Half goes to conservation",
    text: "50% of your purchase is donated to verified shark and ocean conservation organizations. The impact is real.",
  },
  {
    step: "03",
    title: "Receive your status",
    text: "Get a personalized certificate, feel symbolically safer around sharks, and know you actually helped protect them.",
  },
];

const faqs = [
  {
    question: "Is the alliance real?",
    answer:
      "The alliance is fictional and intentionally humorous. The conservation donations are real and verifiable.",
  },
  {
    question: "Does membership protect me from sharks?",
    answer:
      "No. Your certificate provides zero marine protection. It does, however, help protect actual sharks from us.",
  },
  {
    question: "Where does the money actually go?",
    answer:
      "50% goes directly to verified ocean and shark conservation organizations. 50% keeps the Alliance running — servers, design, coffee, and one very tired human.",
  },
  {
    question: "Why sharks?",
    answer:
      "Humans kill roughly 100 million sharks per year. Sharks kill about 5 humans. They need better PR, and they need real help. We do both.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes. A personalized digital certificate with your name, membership tier, and an air of surprisingly official diplomatic recognition.",
  },
  {
    question: "Can I give this as a gift?",
    answer:
      "Absolutely. Protected Friend Status is the most popular gift option — funny enough to share, polished enough to frame.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />

        {/* Real Impact — the core differentiator */}
        <section id="real-impact" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                Real Impact
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Funny certificate. Real conservation.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Every certificate sold directly funds real ocean and shark
                conservation. The joke is fictional. The impact is not.
              </p>
            </div>

            {/* Split bar */}
            <div className="mx-auto mt-10 max-w-2xl">
              <div className="flex h-14 overflow-hidden rounded-full shadow-lg">
                <div className="flex flex-1 items-center justify-center bg-gradient-to-r from-teal-500 to-teal-600 text-sm font-bold text-white">
                  50% → Shark Conservation 🦈
                </div>
                <div className="flex flex-1 items-center justify-center bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-sm font-bold text-white">
                  50% → Alliance Operations ☕
                </div>
              </div>
            </div>

            {/* Two explanation cards */}
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-teal-200 bg-gradient-to-b from-teal-50 to-white p-8 shadow-[0_16px_50px_rgba(25,87,138,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-xl">
                    🌊
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                    50% — For the sharks (for real)
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  Half of every sale goes directly to verified ocean and shark
                  conservation organizations. No middlemen, no vague promises,
                  no &ldquo;administrative fees&rdquo; that mysteriously eat the
                  budget like a tiger shark eating a surfboard.
                </p>
              </div>

              <div className="rounded-[2rem] border border-orange-200 bg-gradient-to-b from-orange-50 to-white p-8 shadow-[0_16px_50px_rgba(25,87,138,0.06)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                    ☕
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                    50% — For the human who built this
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  The other half keeps the servers running and the Alliance
                  founder fed. Because while sharks eat fish, humans
                  unfortunately require rent, coffee, and the occasional
                  non-symbolic meal. Think of it as funding the Alliance&apos;s
                  land-based operations department (staff: one very tired
                  person).
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-sky-100 bg-white p-5 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                  Basic — $9
                </p>
                <p className="mt-3">
                  <span className="text-xl font-semibold text-teal-600">$4.50</span>
                  <span className="text-sm text-[var(--muted)]"> → conservation</span>
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-teal-100 bg-white p-5 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Protected Friend — $19
                </p>
                <p className="mt-3">
                  <span className="text-xl font-semibold text-teal-600">$9.50</span>
                  <span className="text-sm text-[var(--muted)]"> → conservation</span>
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                  Non-Snack — $29
                </p>
                <p className="mt-3">
                  <span className="text-xl font-semibold text-teal-600">$14.50</span>
                  <span className="text-sm text-[var(--muted)]"> → conservation</span>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-4">
              <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
                <p className="text-3xl font-semibold text-[var(--brand-dark)]">100M</p>
                <p className="mt-1 text-xs text-[var(--muted)]">sharks killed by humans / year</p>
              </div>
              <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
                <p className="text-3xl font-semibold text-[var(--brand-dark)]">~5</p>
                <p className="mt-1 text-xs text-[var(--muted)]">humans killed by sharks / year</p>
              </div>
              <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
                <p className="text-3xl font-semibold text-[var(--brand-dark)]">⅓</p>
                <p className="mt-1 text-xs text-[var(--muted)]">of shark species threatened</p>
              </div>
              <div className="rounded-[1.5rem] border border-sky-100 bg-[var(--surface-soft)] p-4 text-center">
                <p className="text-3xl font-semibold text-[var(--brand-dark)]">450M</p>
                <p className="mt-1 text-xs text-[var(--muted)]">years sharks have existed</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                How it works
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Fast, symbolic and surprisingly impactful.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                Three steps: pick a certificate, fund real conservation, and
                enjoy a measurable improvement in diplomatic shark vibes.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {howItWorks.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                    {item.step}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                About the alliance
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                A fictional world with a very real mission.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                Shark Human Alliance is a playful fictional universe where sharks
                actively work on their public image, issue diplomatic statements,
                and advocate for better relations with humans.
              </p>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                The tone is humorous, but the mission is dead serious: turn fear
                into curiosity, fund real conservation, and make sharks feel less
                like monsters and more like misunderstood ocean neighbors with a
                branding problem.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_18px_60px_rgba(25,87,138,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Certificate preview
              </p>

              <div className="mt-6 rounded-[1.75rem] border-2 border-dashed border-sky-200 bg-[var(--surface-soft)] p-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">
                  Certificate of Alliance Membership
                </p>
                <p className="mt-6 text-sm text-[var(--muted)]">
                  This certifies that
                </p>
                <p className="mt-3 text-3xl font-semibold text-[var(--brand-dark)]">
                  [ Your Name Here ]
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  is officially recognized by the Shark Human Alliance as a
                  supporter of peaceful shark-human relations and a contributor
                  to real ocean conservation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Membership */}
        <section id="membership" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Membership options
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Choose your level of shark diplomacy.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                Every tier includes a personalized certificate, symbolic alliance
                status, and a real donation to shark conservation.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <MembershipCard
                variant="basic"
                title="Basic Membership"
                price="$9"
                description="A clean entry point into the alliance. Digital certificate, symbolic status, and $4.50 donated to ocean conservation."
                features={[
                  "Digital certificate",
                  "Alliance membership ID",
                  "$4.50 to shark conservation",
                ]}
                ctaLabel="Start with basic"
                href="/membership#basic"
              />

              <MembershipCard
                variant="protected"
                title="Protected Friend Status"
                price="$19"
                description="The flagship tier — polished, giftable, and $9.50 goes directly to protecting sharks and their habitat."
                features={[
                  "Personalized certificate",
                  "Protected Friend recognition",
                  "$9.50 to shark conservation",
                ]}
                ctaLabel="Choose protected"
                href="/membership#protected"
              />

              <MembershipCard
                variant="nonsnack"
                title="Non-Snack Recognition"
                price="$29"
                description="Peak symbolic prestige for humans who refuse to be considered menu-adjacent. $14.50 donated to conservation."
                features={[
                  "Premium certificate",
                  "Official Non-Snack designation",
                  "$14.50 to shark conservation",
                ]}
                ctaLabel="Go non-snack"
                href="/membership#nonsnack"
              />
            </div>
          </div>
        </section>

        {/* Transparency note */}
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-[2rem] border border-white/70 bg-[var(--surface-soft)] p-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                    Transparency
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--brand-dark)]">
                    We publish where the money goes.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    Quarterly reports showing exactly how much was donated and to
                    which organizations. If a shark could read a spreadsheet, they
                    would approve.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                    Legal clarity
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-[var(--brand-dark)]">
                    Fictional brand. Real donations.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                    The Shark Human Alliance is a fictional entertainment brand.
                    Conservation donations are real and verifiable. Your
                    certificate does not protect you from actual sharks. It does,
                    however, help protect actual sharks from us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                FAQ
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Clarifications for sensible humans.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {faqs.map((item) => (
                <article
                  key={item.question}
                  className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]"
                >
                  <h3 className="text-xl font-semibold text-[var(--brand-dark)]">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}