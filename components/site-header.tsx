import Link from "next/link";

const navItems = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
  { label: "Membership", href: "/membership" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-sm font-semibold text-white shadow-lg shadow-sky-200/60">
            SHA
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-[var(--brand-dark)]">
              Shark Human Alliance
            </p>
            <p className="text-xs text-[var(--muted)]">
              Peace between humans and sharks
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--brand-dark)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/membership"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
        >
          Join the Alliance
        </Link>
      </div>
    </header>
  );
}