import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Tech Xpress pour toute question sur nos produits ou votre commande.",
};

export default function ContactPage() {
  return <ContactClient />;
}
