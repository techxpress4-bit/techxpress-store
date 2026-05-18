import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — TechXpress DZ",
  description: "Mentions légales de TechXpress DZ, boutique en ligne de produits électroniques en Algérie.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-10">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-white">Mentions légales</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
          Mentions légales
        </h1>
        <p className="text-sm text-[#6b7280] mb-12">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-[#9ca3af] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              1. Éditeur du site
            </h2>
            <div className="space-y-2 p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p><span className="text-white font-medium">Dénomination :</span> TechXpress DZ</p>
              <p><span className="text-white font-medium">Registre du commerce :</span> 16/00-5150308 A23</p>
              <p><span className="text-white font-medium">NIF :</span> 193161303818169</p>
              <p><span className="text-white font-medium">Siège social :</span> Bab Ezzouar, Alger, Algérie</p>
              <p><span className="text-white font-medium">Directeur de la publication :</span> TechXpress DZ</p>
              <p><span className="text-white font-medium">Contact :</span> Via WhatsApp ou le formulaire de contact</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              2. Hébergement
            </h2>
            <div className="space-y-2 p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p><span className="text-white font-medium">Hébergeur :</span> Cloudflare, Inc.</p>
              <p><span className="text-white font-medium">Adresse :</span> 101 Townsend St, San Francisco, CA 94107, États-Unis</p>
              <p><span className="text-white font-medium">Site :</span> cloudflare.com</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              3. Propriété intellectuelle
            </h2>
            <p>
              L'ensemble des contenus présents sur le site techxpressdz.com (textes, images, graphismes, logos, vidéos, icônes) est la propriété exclusive de TechXpress DZ ou de ses partenaires. Toute reproduction, distribution, modification ou utilisation à des fins commerciales sans autorisation écrite préalable est strictement interdite et constitue une contrefaçon.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              4. Limitation de responsabilité
            </h2>
            <p>
              TechXpress DZ s'efforce de fournir des informations exactes et à jour. Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité de toutes les informations publiées. TechXpress DZ décline toute responsabilité pour les dommages directs ou indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              5. Cookies
            </h2>
            <p>
              Le site techxpressdz.com peut utiliser des cookies à des fins d'analyse d'audience (Google Analytics). Conformément à la réglementation applicable, vous êtes informé de leur utilisation lors de votre première visite et pouvez les refuser. Consultez notre{" "}
              <Link href="/confidentialite" className="underline hover:text-white transition-colors">politique de confidentialité</Link>{" "}
              pour plus d'informations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              6. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont régies par la législation algérienne, notamment :
            </p>
            <ul className="mt-3 space-y-1.5 list-disc list-inside">
              <li>Loi n°04-02 du 23 juin 2004 fixant les règles applicables aux pratiques commerciales</li>
              <li>Loi n°18-05 du 10 mai 2018 relative au commerce électronique</li>
              <li>Loi n°18-07 du 10 juin 2018 relative à la protection des données à caractère personnel</li>
              <li>Décret exécutif n°05-468 du 10 décembre 2005 fixant les conditions et modalités d'application du service après-vente</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              7. Contact
            </h2>
            <p>
              Pour toute question relative aux présentes mentions légales, contactez-nous via le{" "}
              <Link href="/contact" className="underline hover:text-white transition-colors">formulaire de contact</Link>{" "}
              ou sur WhatsApp.
            </p>
          </section>

        </div>

        {/* Liens légaux */}
        <div className="mt-14 pt-8 flex flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { label: "CGV", href: "/cgv" },
            { label: "Confidentialité", href: "/confidentialite" },
            { label: "Politique de retour", href: "/politique-retour" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="text-xs text-[#6b7280] hover:text-white transition-colors underline underline-offset-4">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
