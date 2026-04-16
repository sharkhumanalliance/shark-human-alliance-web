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
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["700"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: {
    default: "Shark Human Alliance — Official Shark Protection Certificates",
    template: "%s | Shark Human Alliance",
  },
  description:
    "Get your official Protected Friend Status certificate. A hilarious personalized gift that funds real shark conservation. Digital delivery, from $4.",
  metadataBase: new URL("https://sharkhumanalliance.com"),
  openGraph: {
    type: "website",
    siteName: "Shark Human Alliance",
    title: "Shark Human Alliance — Official Shark Protection Certificates",
    description:
      "Get official Protected Friend status and fund real shark conservation. The perfect gag gift for anyone who's ever side-eyed the ocean.",
    images: [
      {
        url: "/mascots/homepage-hero-plush.png",
        width: 1152,
        height: 768,
        alt: "Finnley Mako and Luna Reef — Shark Human Alliance ambassadors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shark Human Alliance",
    description:
      "Official shark protection certificates + real conservation funding. From $4.",
    images: ["/mascots/homepage-hero-plush.png"],
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
      en: "/en",
      es: "/es",
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
    url: "https://sharkhumanalliance.com",
    logo: "https://sharkhumanalliance.com/mascots/homepage-hero-plush.png",
    description:
      "A fictional alliance helping humans and sharks build better relations. Every certificate sale funds real ocean conservation.",
    email: "sharkhumanalliance@gmail.com",
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Protected Friend Status Certificate",
    description:
      "A personalized, surprisingly official-looking shark protection certificate. The perfect gag gift that funds real ocean conservation.",
    image: "https://sharkhumanalliance.com/mascots/homepage-hero-plush.png",
    brand: { "@type": "Brand", name: "Shark Human Alliance" },
    offers: [
      {
        "@type": "Offer",
        name: "Protected Friend Status",
        price: "4.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://sharkhumanalliance.com/purchase?tier=protected",
      },
      {
        "@type": "Offer",
        name: "Non-Snack Recognition",
        price: "19.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://sharkhumanalliance.com/purchase?tier=nonsnack",
      },
      {
        "@type": "Offer",
        name: "Shark-Approved Zone",
        price: "99.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://sharkhumanalliance.com/purchase?tier=business",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
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
  const t = await getTranslations({ locale, namespace: "accessibility" });

  return (
    <html lang={locale}>
      <head>
        <JsonLd />
        <link rel="alternate" hrefLang="en" href="https://sharkhumanalliance.com/en" />
        <link rel="alternate" hrefLang="es" href="https://sharkhumanalliance.com/es" />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://sharkhumanalliance.com/en"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${cormorantGaramond.variable} ${cinzel.variable} ${robotoCondensed.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <a
          href="#main"
          className="absolute -top-12 left-4 z-[100] rounded-b-lg bg-[var(--brand-dark)] px-4 py-2 text-sm font-semibold text-white transition focus-visible:top-0"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={messages}>
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

