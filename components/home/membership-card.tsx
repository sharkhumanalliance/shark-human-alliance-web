import { LocalizedLink } from "@/components/ui/localized-link";
import {
  getTierBadgeClass,
  getTierBorderClass,
  getTierBulletClass,
  getTierButtonClass,
  getTierSurfaceClass,
  type TierKey,
} from "@/lib/tiers";

type MembershipCardProps = {
  id?: string;
  href?: string;
  variant: TierKey;
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaLabel: string;
  eyebrow?: string;
  popular?: boolean;
  popularLabel?: string;
};

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
        className={`scroll-mt-28 flex h-full flex-col rounded-xl border ${getTierBorderClass(
          variant,
          popular
        )} ${getTierSurfaceClass(variant)} p-5 sm:p-5`}
      >
        <div
          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getTierBadgeClass(
            variant
          )}`}
        >
          {eyebrow ?? title}
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-tight text-[var(--brand-dark)]">
          {title}
        </h3>

        <p className="mt-1.5 text-3xl font-semibold text-[var(--brand-dark)]">
          {price}
        </p>

        <p className="mt-2.5 text-sm leading-6 text-[var(--muted)]">{description}</p>

        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm leading-6 text-[var(--brand-dark)]"
            >
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${getTierBulletClass(variant)}`} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <LocalizedLink
          href={href}
          className={`mt-5 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition-colors duration-300 ease-out ${getTierButtonClass(
            variant
          )}`}
        >
          {ctaLabel}
        </LocalizedLink>
      </article>
    </div>
  );
}
