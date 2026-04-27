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
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
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
    "The internet's most official-ish human protection program. For shark-related concerns. Sharks deserve better PR. And real protection.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "Shark Human Alliance",
    title: "Shark Human Alliance — Official Shark Protection Certificates",
    description:
      "The internet's most official-ish human protection program. For shark-related concerns. Sharks deserve better PR. And real protection.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shark Human Alliance",
    description:
      "The internet's most official-ish human protection program. For shark-related concerns.",
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
    url: BASE_URL,
    logo: `${BASE_URL}/mascots/homepage-hero-plush.png`,
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
    image: `${BASE_URL}/mascots/homepage-hero-plush.png`,
    brand: { "@type": "Brand", name: "Shark Human Alliance" },
    offers: [
      {
        "@type": "Offer",
        name: "Protected Friend Status",
        price: "4.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/en/purchase?tier=protected`,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
          },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        },
      },
      {
        "@type": "Offer",
        name: "Non-Snack Recognition",
        price: "19.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/en/purchase?tier=nonsnack`,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
          },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        },
      },
      {
        "@type": "Offer",
        name: "Shark-Approved Zone",
        price: "99.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/en/purchase?tier=business`,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
          },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "US",
          returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        },
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
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${BASE_URL}/en`}
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
