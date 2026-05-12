import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

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
  title: {
    default: "Tech Xpress — Électronique & Multimédia en Algérie",
    template: "%s | Tech Xpress",
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
    title: "Tech Xpress — Électronique & Multimédia en Algérie",
    description:
      "Boutique en ligne premium de produits tech en Algérie. Paiement à la livraison.",
    siteName: "Tech Xpress",
    locale: "fr_DZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
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
