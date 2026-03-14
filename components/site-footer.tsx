export function SiteFooter() {
  return (
    <footer className="border-t border-white/60 bg-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--brand-dark)]">
            Shark Human Alliance
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            A fictional alliance for better shark-human relations.
          </p>
        </div>

        <div className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          <a href="#about" className="transition hover:text-[var(--brand-dark)]">
            About
          </a>
          <a href="#membership" className="transition hover:text-[var(--brand-dark)]">
            Membership
          </a>
          <a href="#faq" className="transition hover:text-[var(--brand-dark)]">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}