import { HeroSection } from "@/components/home/hero-section";
import { MembershipCard } from "@/components/home/membership-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const howItWorks = [
  {
    step: "01",
    title: "Join the Alliance",
    text: "Become an official supporter of peaceful shark-human relations.",
  },
  {
    step: "02",
    title: "Receive your certificate",
    text: "Get a personalized Shark Human Alliance membership certificate.",
  },
  {
    step: "03",
    title: "Enjoy improved relations",
    text: "Feel slightly safer knowing sharks may now view you as a friend. Symbolically.",
  },
];

const faqs = [
  {
    question: "Is the alliance real?",
    answer:
      "No. Shark Human Alliance is fictional and intentionally humorous.",
  },
  {
    question: "Does membership protect me from sharks?",
    answer:
      "No. Membership is symbolic and does not provide real-world marine protection.",
  },
  {
    question: "Why sharks?",
    answer:
      "Because sharks are often misunderstood, and humor is a good way to invite curiosity instead of panic.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes. The concept is built around a digital certificate and playful alliance membership tiers.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />

        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                How it works
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Fast, symbolic and surprisingly official.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                The concept is simple: join the alliance, receive your certificate,
                and enjoy a measurable improvement in diplomatic shark vibes.
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

        <section id="about" className="py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                About the alliance
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                A fictional idea with a very clear point.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                Shark Human Alliance is a playful fictional world in which sharks
                actively work on their public image and advocate for better
                relations with humans.
              </p>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                The tone is humorous, but the goal is real: turn fear into
                curiosity, and make sharks feel less like monsters and more like
                misunderstood ocean neighbors with a branding problem.
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
                  supporter of peaceful shark-human relations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="membership" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-800">
                Membership options
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Choose your level of shark diplomacy.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <MembershipCard
                variant="basic"
                title="Basic Membership"
                price="$9"
                description="A clean entry point into the alliance for kind-hearted humans with strong diplomatic potential."
                features={[
                  "Digital certificate",
                  "Alliance membership ID",
                  "Welcome message from the alliance",
                ]}
                ctaLabel="Start with basic"
                href="/membership#basic"
              />

              <MembershipCard
                variant="protected"
                title="Protected Friend Status"
                price="$19"
                description="Enhanced recognition within the alliance for humans who deserve a slightly warmer reception from sharks."
                features={[
                  "Personalized certificate",
                  "Protected Friend recognition",
                  "Alliance badge",
                ]}
                ctaLabel="See membership page"
                href="/membership#protected"
              />

              <MembershipCard
                variant="nonsnack"
                title="Non-Snack Recognition"
                price="$29"
                description="Our most prestigious symbolic status for humans who would prefer not to be considered menu-adjacent."
                features={[
                  "Premium certificate",
                  "Official Non-Snack designation",
                  "Downloadable recognition badge",
                ]}
                ctaLabel="See premium option"
                href="/membership#nonsnack"
              />
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