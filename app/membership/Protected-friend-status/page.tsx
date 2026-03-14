import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const includedItems = [
  "Personalized digital certificate",
  "Protected Friend Status designation",
  "Alliance badge",
  "Giftable symbolic recognition",
];

const faqs = [
  {
    question: "Is this actual protection from sharks?",
    answer:
      "No. Protected Friend Status is a fictional symbolic product and does not provide real-world protection of any kind.",
  },
  {
    question: "Why is this the main product?",
    answer:
      "Because it is the clearest balance between funny, polished and giftable. It is more distinctive than Basic Membership and cleaner than the more absurd Non-Snack tier.",
  },
  {
    question: "What should happen after purchase later on?",
    answer:
      "The intended flow is checkout, certificate personalization, confirmation, and digital delivery of the certificate.",
  },
];

export default function ProtectedFriendStatusPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-medium text-[var(--brand-dark)] shadow-sm">
                Flagship membership product
              </div>

              <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-6xl">
                Protected Friend Status
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
                A symbolic recognition tier for humans who deserve a slightly
                warmer reception from sharks and a significantly more official-looking certificate.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#buy"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--brand)] px-6 py-4 text-base font-semibold text-white transition hover:bg-[var(--brand-dark)]"
                >
                  Choose Protected Friend
                </a>
                <a
                  href="/membership"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:border-sky-300 hover:bg-sky-50"
                >
                  Back to membership
                </a>
              </div>

              <p className="mt-5 text-sm text-[var(--muted)]">
                Recommended as the core launch product for Shark Human Alliance.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(25,87,138,0.12)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
                What is included
              </p>

              <p className="mt-4 text-4xl font-semibold text-[var(--brand-dark)]">
                $19
              </p>

              <ul className="mt-8 space-y-4">
                {includedItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-7 text-[var(--foreground)]"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-[1.5rem] border border-teal-100 bg-teal-50/60 p-5">
                <p className="text-sm font-semibold text-[var(--brand-dark)]">
                  Best use case
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  This is the best tier for gifting, brand clarity and certificate-led monetization.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
                Why this product works
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Funny enough to be shareable. Clean enough to feel premium.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[var(--muted)]">
                Protected Friend Status sits exactly where the concept works best:
                clearly humorous, clearly fictional, but still polished enough to
                feel like a real gift product rather than a throwaway joke.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <article className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
                  01
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  Clear concept
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  The name is funny, but still readable and gift-worthy.
                </p>
              </article>

              <article className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  02
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  Strong certificate fit
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  It naturally supports a personalized certificate and recognition badge.
                </p>
              </article>

              <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                  03
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[var(--brand-dark)]">
                  Best launch product
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  If only one paid product exists at launch, it should probably be this one.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="buy" className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-[2.25rem] border border-white/70 bg-[var(--brand-dark)] px-8 py-12 text-white shadow-[0_22px_80px_rgba(15,39,64,0.25)] sm:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">
                Purchase flow placeholder
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">
                Next step: connect this page to checkout.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-100/90">
                For now this is a polished product detail page. The next build step
                will be adding a purchase button, then checkout, then certificate personalization.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/membership"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-base font-semibold text-[var(--brand-dark)] transition hover:bg-sky-50"
                >
                  View all membership tiers
                </a>
                <a
                  href="/#faq"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Read FAQ
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-800">
                FAQ
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--brand-dark)]">
                Product clarifications.
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