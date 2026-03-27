"use client";

import Link, { type LinkProps } from "next/link";
import { useLocale } from "next-intl";
import { buildLocalizedPath } from "@/lib/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type LocalizedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Omit<LinkProps, "href"> & {
    href: string;
    children: ReactNode;
  };

export function LocalizedLink({ href, children, ...props }: LocalizedLinkProps) {
  const locale = useLocale();
  return (
    <Link href={buildLocalizedPath(locale, href)} {...props}>
      {children}
    </Link>
  );
}
