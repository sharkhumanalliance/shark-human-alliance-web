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
  popular?: boolean;
  popularLabel?: string;
  className?: string;
};

function getBadgeClass(variant: MembershipVariant) {
  if (variant === "basic") return "bg-sky-100 text-sky-800";
  if (variant === "protected") return "bg-teal-100 text-teal-800";
  if (variant === "business") return "bg-indigo-100 text-indigo-800";
  return "bg-orange-100 text-orange-800";
}

function getBorderClass(variant: MembershipVariant, popular?: boolean) {
  if (popular) return "border-teal-400/50";
  if (variant === "basic") return "border-sky-100";
  if (variant === "protected") return "border-teal-100";
  if (variant === "business") return "border-indigo-100";
  return "border-orange-100";
}

function getBulletClass(variant: MembershipVariant) {
  if (variant === "basic") return "bg-sky-500";
  if (variant === "protected") return "bg-teal-500";
  if (variant === "business") return "bg-indigo-500";
  return "bg-orange-500";
}

function getButtonClass(variant: MembershipVariant) {
  if (variant === "basic") {
    return "border border-[var(--border)] bg-white text-[var(--brand-dark)] hover:bg-sky-50";
  }

  if (variant === "protected") {
    return "border border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]";
  }

  if (variant === "business") {
    return "border border-transparent bg-indigo-600 text-white hover:bg-indigo-700";
  }

  return "border border-transparent bg-sky-700 text-white hover:bg-sky-800";
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
  popular,
  popularLabel,
  className = "",
}: MembershipCardProps) {
  return (
    <div className={popular ? "relative" : ""}>
      {popular && popularLabel && (
        <div className="absolute -top-3 left-6 z-10 inline-flex rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          {popularLabel}
        </div>
      )}
      <article
        id={id}
        className={`flex h-full min-w-[82vw] snap-start scroll-mt-28 flex-col rounded-2xl border ${getBorderClass(
          variant,
          popular
        )} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:min-w-[360px] sm:p-7 lg:min-w-0 ${
          popular ? "ring-1 ring-teal-400/20 shadow-md" : ""
        } ${className}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div
            className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getBadgeClass(
              variant
            )}`}
          >
            {title}
          </div>
          <p className="shrink-0 text-3xl font-semibold tracking-tight text-[var(--brand-dark)] sm:text-[2rem]">
            {price}
          </p>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)] md:min-h-[4.75rem]">
          {description}
        </p>

        <ul className="mt-6 flex-grow space-y-3 border-t border-[var(--border)] pt-5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]"
            >
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${getBulletClass(variant)}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <LocalizedLink
          href={href}
          className={`mt-7 inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold transition ${getButtonClass(
            variant
          )}`}
        >
          {ctaLabel}
        </LocalizedLink>
      </article>
    </div>
  );
}
