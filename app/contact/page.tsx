import { Metadata } from "next";
import ContactClient from "./ContactClient";
import { sanityFetch } from "@/lib/sanity";
import { settingsQuery } from "@/lib/queries";
import type { SanitySettings } from "@/lib/types";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Tech Xpress pour toute question sur nos produits ou votre commande.",
};

export default async function ContactPage() {
  let settings: SanitySettings | null = null;
  try {
    settings = await sanityFetch<SanitySettings>(settingsQuery, {}, { revalidate: 3600 });
  } catch {}

  return (
    <ContactClient
      instagram={settings?.reseauxSociaux?.instagram}
      tiktok={settings?.reseauxSociaux?.tiktok}
    />
  );
}
