import { LocalizedLink } from "@/components/ui/localized-link";

type MembershipVariant = "basic" | "protected" | "nonsnack" | "business";

type MembershipCardProps = {
  id?: string;
  href?: string;
  variant: MembershipVariant;
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  eyebrow?: string;
  popular?: boolean;
  popularLabel?: string;
};

function getBadgeClass(variant: MembershipVariant) {
  if (variant === "protected") return "bg-[var(--tier-protected-surface)] text-[var(--tier-protected-text)]";
  if (variant === "nonsnack") return "bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)]";
  if (variant === "business") return "bg-[var(--tier-business-surface)] text-[var(--tier-business-muted)]";
  if (variant === "basic") return "bg-sky-100 text-sky-800";
  return "bg-slate-100 text-slate-700";
}

function getSurfaceClass(variant: MembershipVariant) {
  if (variant === "protected") return "bg-[var(--tier-protected-light)]/35";
  if (variant === "nonsnack") return "bg-[var(--tier-nonsnack-light)]/30";
  if (variant === "business") return "bg-[var(--tier-business-light)]/45";
  if (variant === "basic") return "bg-sky-50/30";
  return "bg-white";
}

function getBorderClass(variant: MembershipVariant, popular?: boolean) {
  if (popular) return "border-[var(--tier-protected-border)]/70";
  if (variant === "protected") return "border-[var(--tier-protected-border)]";
  if (variant === "nonsnack") return "border-[var(--tier-nonsnack-border)]";
  if (variant === "business") return "border-[var(--tier-business-border)]";
  if (variant === "basic") return "border-sky-200";
  return "border-[var(--border)]";
}

function getBulletClass(variant: MembershipVariant) {
  if (variant === "protected") return "bg-[var(--tier-protected)]";
  if (variant === "nonsnack") return "bg-[var(--tier-nonsnack)]";
  if (variant === "business") return "bg-[var(--tier-business)]";
  if (variant === "basic") return "bg-sky-500";
  return "bg-slate-500";
}

function getButtonClass(variant: MembershipVariant) {
  if (variant === "protected") {
    return "border border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]";
  }
  if (variant === "nonsnack") {
    return "border border-[var(--tier-nonsnack-border)] bg-[var(--tier-nonsnack-surface)] text-[var(--tier-nonsnack-text)] hover:bg-[var(--tier-nonsnack-border)]";
  }
  if (variant === "business") {
    return "border border-[var(--tier-business-border)] bg-[var(--tier-business-surface)] text-[var(--tier-business-text)] hover:bg-[var(--tier-business-border)]";
  }
  if (variant === "basic") {
    return "border border-sky-200 bg-sky-100 text-sky-900 hover:bg-sky-200";
  }
  return "border border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]";
}

export function MembershipCard({
  id,
  href = "#join",
  variant,
  title,
  price,
  description,
  features,
  ctaLabel,
  eyebrow,
  popular,
  popularLabel,
}: MembershipCardProps) {
  return (
    <div className={popular ? "relative" : ""}>
      {popular && popularLabel && (
        <div className="absolute -top-3 left-4 z-10 inline-flex rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg sm:left-6 sm:px-4 sm:text-xs">
          {popularLabel}
        </div>
      )}
      <article
        id={id}
        className={`scroll-mt-28 flex h-full flex-col rounded-xl border ${getBorderClass(
          variant,
          popular
        )} ${getSurfaceClass(variant)} p-5 sm:p-5`}
      >
        <div
          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getBadgeClass(
            variant
          )}`}
        >
          {eyebrow ?? title}
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-tight text-[var(--brand-dark)] sm:min-h-[2.6rem]">
          {title}
        </h3>

        <p className="mt-1.5 text-3xl font-semibold text-[var(--brand-dark)]">
          {price}
        </p>

        <p className="mt-2.5 text-sm leading-6 text-[var(--muted)] sm:min-h-[4rem]">{description}</p>

        <ul className="mt-4 flex-grow space-y-2 sm:min-h-[6.75rem]">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm leading-6 text-[var(--brand-dark)]"
            >
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${getBulletClass(variant)}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <LocalizedLink
          href={href}
          className={`mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-300 ease-out ${getButtonClass(
            variant
          )}`}
        >
          {ctaLabel}
        </LocalizedLink>
      </article>
    </div>
  );
}
