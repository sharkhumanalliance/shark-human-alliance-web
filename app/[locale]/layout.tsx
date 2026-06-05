import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Dancing_Script,
  Cormorant_Garamond,
  Cinzel,
  Roboto_Condensed,
} from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Analytics } from "@/components/analytics";
import { CookieConsent } from "@/components/cookies/cookie-consent";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ScrollToTop } from "@/components/scroll-to-top";
import { BASE_URL } from "@/lib/config";
import { pickClientMessages } from "@/lib/client-messages";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Decorative fonts: used only inside the certificate artwork (globals.css),
// never in the critical hero/above-the-fold text. preload:false keeps them out
// of the <head> preload list so they don't compete with LCP; display:"swap"
// (next/font default) renders fallback text first, then swaps when ready.
const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["700"],
  preload: false,
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  preload: false,
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  preload: false,
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["300", "400"],
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Shark Human Alliance — Official Shark Protection Certificates",
    template: "%s | Shark Human Alliance",
  },
  description:
    "A funny personalized certificate that protects sharks more than it protects you. Official-ish shark paperwork for humans who are probably not food.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "Shark Human Alliance",
    title: "Shark Human Alliance — Official Shark Protection Certificates",
    description:
      "A funny personalized certificate that protects sharks more than it protects you. Official-ish shark paperwork for humans who are probably not food.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shark Human Alliance",
    description:
      "A funny personalized certificate that protects sharks more than it protects you.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    languages: {
      en: `${BASE_URL}/en`,
      es: `${BASE_URL}/es`,
      "x-default": `${BASE_URL}/en`,
    },
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function JsonLd() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shark Human Alliance",
    url: BASE_URL,
    logo: `${BASE_URL}/mascots/homepage-hero-plush.png`,
    description:
      "A fictional alliance selling funny personalized certificates that protect sharks more than they protect humans.",
    email: "sharkhumanalliance@gmail.com",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shark Human Alliance",
    url: BASE_URL,
    publisher: { "@type": "Organization", name: "Shark Human Alliance" },
    inLanguage: ["en", "es"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const clientMessages = pickClientMessages(messages);
  const t = await getTranslations({ locale, namespace: "accessibility" });

  return (
    <html lang={locale}>
      <head>
        <JsonLd />
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${BASE_URL}/en`}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${cormorantGaramond.variable} ${cinzel.variable} ${robotoCondensed.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <a
          href="#main"
          className="absolute -top-12 left-4 z-[100] rounded-b-lg bg-[var(--brand-dark)] px-4 py-2 text-sm font-semibold text-white transition focus-visible:top-0"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <div className="overflow-x-clip">{children}</div>
          <CookieConsent />
        </NextIntlClientProvider>
        <ScrollReveal />
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  );
}
