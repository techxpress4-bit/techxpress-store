import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { sanityFetch } from "@/lib/sanity";
import { settingsQuery } from "@/lib/queries";
import type { SanitySettings } from "@/lib/types";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading-var",
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
  display: "swap",
  weight: ["400", "500", "600"],
});
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Banniere from "@/components/Banniere";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieBanner from "@/components/CookieBanner";
import Analytics from "@/components/Analytics";
import { Toaster } from "react-hot-toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://techxpressdz.com"),
  title: {
    default: "TechXpressDZ — Électronique & Multimédia en Algérie",
    template: "%s | TechXpressDZ",
  },
  description:
    "Votre boutique en ligne de produits électroniques et multimédias en Algérie. Box TV Android, accessoires téléphone, routeurs, câbles et plus. Livraison dans toute l'Algérie, paiement à la livraison.",
  keywords: [
    "électronique Algérie",
    "box TV Android",
    "accessoires téléphone",
    "boutique en ligne Algérie",
    "Tech Xpress",
    "livraison Algérie",
  ],
  openGraph: {
    title: "TechXpressDZ — Électronique & Multimédia en Algérie",
    description: "Boutique en ligne premium de produits tech en Algérie. Paiement à la livraison.",
    siteName: "TechXpressDZ",
    locale: "fr_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechXpressDZ — Électronique en Algérie",
    description: "Box TV, accessoires, routeurs. Livraison nationale. Paiement à la livraison.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings: SanitySettings | null = null;
  try {
    settings = await sanityFetch<SanitySettings>(settingsQuery, {}, { revalidate: 300 });
  } catch {}

  const banniere = settings?.banniere;
  const bannerActive = !!(banniere?.active && banniere?.texte);
  const bannerH = bannerActive ? 32 : 0;

  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${inter.variable}`}
      style={{ "--banner-h": `${bannerH}px` } as React.CSSProperties}
    >
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}
      <body style={bannerH ? { paddingTop: bannerH } : undefined}>
        <CartProvider>
          {bannerActive && (
            <Banniere texte={banniere!.texte!} lien={banniere?.lien} />
          )}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#161616",
                color: "#f5f5f5",
                border: "1px solid #2a2a2a",
                borderRadius: "12px",
              },
            }}
          />
          <Analytics />
          <Navbar />
          <main className="min-h-screen page-enter">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CookieBanner />
        </CartProvider>
      </body>
    </html>
  );
}
