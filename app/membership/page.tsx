import { MembershipCard } from "@/components/home/membership-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const comparisonRows = [
  {
    label: "Certificate",
    basic: "Digital certificate",
    protected: "Personalized certificate",
    nonsnack: "Premium personalized certificate",
  },
  {
    label: "Alliance status",
    basic: "Friend of Sharks",
    protected: "Protected Friend Status",
    nonsnack: "Official Non-Snack Recognition",
  },
  {
    label: "Recognition badge",
    basic: "—",
    protected: "Alliance badge",
    nonsnack: "Premium badge",
  },
  {
    label: "Best for",
    basic: "First-time members",
    protected: "Giftable recognition",
    nonsnack: "Peak symbolic diplomacy",
  },
  {
    label: "Actual marine protection",
    basic: "None",
    protected: "None",
    nonsnack: "Still none",
  },
];

const faqs = [
  {
    question: "Is this a real protective product?",
    answer:
      "No. All memberships are fictional, symbolic, and intended as humorous gifts or fan-style participation in the Shark Human Alliance universe.",
  },
  {
    question: "Will I receive something after payment later on?",
    answer:
      "Yes. The intended product flow is a personalized digital certificate and related alliance recognition assets.",
  },
  {
    question: "Why does the page talk about protection if it is fictional?",
    answer:
      "Because the humor of the project is built around symbolic shark diplomacy. The joke works only if it remains clearly playful and obviously non-literal.",
  },
  {
    question: "Which option should be the main product?",
    answer:
      "Protected Friend Status is probably the strongest main offer. It is clearer and more giftable than Basic Membership, while still slightly more elegant than Non-Snack Recognition.",
  },
];

export default function MembershipPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-[var(--brand-dark)] shadow-sm">
                Symbolic recognition packages
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-6xl">
                Choose your shark diplomacy level.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                Every membership tier is fictional, humorous, and designed to feel
                oddly official. The goal is simple: better shark-human vibes,
                better gifts, and dramatically improved symbolic relations.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#membership"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                >
                  See membership tiers
                </a>
                <a
                  href="#comparison"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
                >
                  Compare options
                </a>
              </div>

              <p className="mt-5 text-sm text-[var(--muted)]">
                Recommended flagship product: <strong>Protected Friend Status</strong>.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(25,87,138,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Product logic
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-sky-100 bg-sky-50/70 p-5">
                  <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                    What people are really buying
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    Not actual protection. Not insurance. Not marine enforcement.
                    They are buying a humorous symbolic status inside the Shark
                    Human Alliance world.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-cyan-100 bg-cyan-50/70 p-5">
                  <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                    Why it works
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    It functions as a funny gift, a shareable certificate, and the
                    core monetization entry point for the whole brand.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-5">
                  <h2 className="text-lg font-semibold text-[var(--brand-dark)]">
                    Tone requirement
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    The product copy must always make clear that this is playful,
                    fictional and symbolic — while still feeling polished and gift-worthy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="membership" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Membership tiers
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Three ways to become more acceptable to sharks.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                Start simple, choose the strongest giftable tier, or go fully into
                symbolic prestige.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <MembershipCard
                id="basic"
                variant="basic"
                title="Basic Membership"
                price="$9"
                description="A clean entry point into the alliance for kind-hearted humans with reasonable diplomatic ambitions."
                features={[
                  "Digital certificate",
                  "Alliance membership ID",
                  "Welcome message from the alliance",
                ]}
                ctaLabel="Choose basic"
                href="#join"
              />

              <MembershipCard
                id="protected"
                variant="protected"
                title="Protected Friend Status"
                price="$19"
                description="The strongest core offer: a humorous, polished and giftable symbolic status inside the alliance."
                features={[
                  "Personalized certificate",
                  "Protected Friend recognition",
                  "Alliance badge",
                ]}
                ctaLabel="Choose protected"
                href="#join"
              />

              <MembershipCard
                id="nonsnack"
                variant="nonsnack"
                title="Non-Snack Recognition"
                price="$29"
                description="A more absurd prestige tier for humans who would strongly prefer not to be considered menu-adjacent."
                features={[
                  "Premium certificate",
                  "Official Non-Snack designation",
                  "Downloadable recognition badge",
                ]}
                ctaLabel="Choose non-snack"
                href="#join"
              />
            </div>
          </div>
        </section>

        <section id="comparison" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Comparison
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Quick decision table.
              </h2>
            </div>

            <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_18px_60px_rgba(25,87,138,0.08)]">
              <div className="grid grid-cols-4 border-b border-sky-100 bg-sky-50/60 text-sm font-semibold text-[var(--brand-dark)]">
                <div className="p-4">Feature</div>
                <div className="p-4">Basic</div>
                <div className="p-4">Protected</div>
                <div className="p-4">Non-Snack</div>
              </div>

              {comparisonRows.map((row, index) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 text-sm ${
                    index !== comparisonRows.length - 1
                      ? "border-b border-sky-100"
                      : ""
                  }`}
                >
                  <div className="p-4 font-medium text-[var(--brand-dark)]">
                    {row.label}
                  </div>
                  <div className="p-4 text-[var(--muted)]">{row.basic}</div>
                  <div className="p-4 text-[var(--muted)]">{row.protected}</div>
                  <div className="p-4 text-[var(--muted)]">{row.nonsnack}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <article className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  01
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  Pick a tier
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Choose the version that best matches the gift, joke intensity,
                  and symbolic prestige you want.
                </p>
              </article>

              <article className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  02
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  Personalize the certificate
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Add the recipient name and optional dedication so the membership
                  feels like a real gift, not just a joke.
                </p>
              </article>

              <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  03
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  Deliver symbolic recognition
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  The recipient receives an official-looking alliance document and
                  a major boost in shark diplomacy aesthetics.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-[2rem] border border-white/70 bg-[var(--surface-soft)] p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Important clarification
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--brand-dark)]">
                This is a fictional symbolic product.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
                Membership in the Shark Human Alliance does not provide legal,
                physical, spiritual, maritime, biological, emotional, or anti-bite
                protection. It is a humorous product concept designed for gifts,
                certificates and brand storytelling.
              </p>
            </div>
          </div>
        </section>

        <section id="faq" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                FAQ
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Product questions worth answering clearly.
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

        <section id="join" className="pb-24 pt-8">
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-[2.25rem] border border-white/70 bg-[var(--brand-dark)] px-8 py-12 text-white shadow-[0_22px_80px_rgba(15,39,64,0.25)] sm:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
                Recommended next step
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
                Build Protected Friend Status first.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100/90">
                It is the best flagship offer: funny, polished, easy to understand,
                and ideal for certificate-based gifting.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#protected"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-sky-50"
                >
                  Focus on Protected Friend
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Back to homepage
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}