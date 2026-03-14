type MembershipVariant = "basic" | "protected" | "nonsnack";

type MembershipCardProps = {
  id?: string;
  href?: string;
  variant: MembershipVariant;
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
};

function getBadgeClass(variant: MembershipVariant) {
  if (variant === "basic") return "bg-sky-100 text-sky-800";
  if (variant === "protected") return "bg-teal-100 text-teal-800";
  return "bg-orange-100 text-orange-800";
}

function getBorderClass(variant: MembershipVariant) {
  if (variant === "basic") return "border-sky-100";
  if (variant === "protected") return "border-teal-100";
  return "border-orange-100";
}

function getButtonClass(variant: MembershipVariant) {
  if (variant === "basic") {
    return "border border-[var(--border)] bg-white text-[var(--brand-dark)] hover:bg-sky-50";
  }

  if (variant === "protected") {
    return "border border-transparent bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]";
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
}: MembershipCardProps) {
  return (
    <article
      id={id}
      className={`scroll-mt-28 rounded-[2rem] border ${getBorderClass(
        variant
      )} bg-white p-6 shadow-[0_16px_50px_rgba(25,87,138,0.08)]`}
    >
      <div
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getBadgeClass(
          variant
        )}`}
      >
        {title}
      </div>

      <p className="mt-5 text-3xl font-semibold text-[var(--brand-dark)]">
        {price}
      </p>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{description}</p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-3 text-sm leading-6 text-[var(--foreground)]"
          >
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${getButtonClass(
          variant
        )}`}
      >
        {ctaLabel}
      </a>
    </article>
  );
}