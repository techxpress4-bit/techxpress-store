import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — TechXpress DZ",
  description: "Comment TechXpress DZ collecte, utilise et protège vos données personnelles.",
};

export default function ConfidentialitePage() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-10">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-white">Politique de confidentialité</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
          Politique de confidentialité
        </h1>
        <p className="text-sm text-[#6b7280] mb-12">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-[#9ca3af] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              1. Responsable du traitement
            </h2>
            <p>
              TechXpress DZ, immatriculé sous le RC n°16/00-5150308 A23, Bab Ezzouar, Alger, est responsable du traitement de vos données personnelles collectées via le site techxpressdz.com, conformément à la loi algérienne n°18-07 du 10 juin 2018 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              2. Données collectées
            </h2>
            <p className="mb-4">Nous collectons uniquement les données strictement nécessaires au traitement de vos commandes :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: "👤", label: "Identité", desc: "Prénom, nom" },
                { icon: "📍", label: "Localisation", desc: "Adresse de livraison, wilaya" },
                { icon: "📞", label: "Contact", desc: "Numéro de téléphone" },
                { icon: "📦", label: "Commande", desc: "Produits commandés, historique" },
                { icon: "📊", label: "Navigation", desc: "Cookies analytics (Google Analytics)" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-white font-medium text-xs uppercase tracking-wide mb-1">{item.label}</p>
                    <p className="text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#6b7280]">
              Nous ne collectons aucune donnée bancaire — le paiement s'effectue exclusivement en espèces à la livraison.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              3. Finalités du traitement
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Traitement et suivi de vos commandes</li>
              <li>Livraison des produits à votre adresse</li>
              <li>Communication relative à votre commande (confirmation, suivi)</li>
              <li>Amélioration de nos services via des statistiques anonymisées</li>
              <li>Respect de nos obligations légales et comptables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              4. Durée de conservation
            </h2>
            <p>
              Vos données personnelles sont conservées pendant une durée maximale de <strong className="text-white">3 ans</strong> à compter de votre dernière commande, conformément aux obligations légales algériennes. Les données de navigation (cookies) sont conservées pour une durée maximale de <strong className="text-white">13 mois</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              5. Partage des données
            </h2>
            <p className="mb-3">
              Vos données ne sont <strong className="text-white">jamais vendues</strong> à des tiers. Elles peuvent être partagées uniquement avec :
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-white">Transporteurs partenaires</strong> — pour assurer la livraison de votre commande (nom, adresse, téléphone uniquement)</li>
              <li><strong className="text-white">Google Analytics</strong> — pour les statistiques de navigation, sous forme anonymisée</li>
              <li><strong className="text-white">Autorités compétentes</strong> — sur réquisition légale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              6. Cookies
            </h2>
            <p className="mb-3">
              Le site utilise des cookies pour améliorer votre expérience de navigation et mesurer notre audience. Un bandeau d'information vous permet d'accepter ou de refuser les cookies non essentiels lors de votre première visite.
            </p>
            <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
              {[
                { type: "Essentiels", desc: "Nécessaires au fonctionnement du site (session, panier)", obligatoire: true },
                { type: "Analytics", desc: "Google Analytics — mesure d'audience anonymisée", obligatoire: false },
              ].map((cookie, i) => (
                <div key={cookie.type}
                  className={`flex items-center justify-between gap-4 px-4 py-3 text-xs ${i % 2 === 0 ? "bg-[#111]" : "bg-[#161616]"}`}>
                  <div>
                    <p className="text-white font-medium">{cookie.type}</p>
                    <p className="text-[#6b7280] mt-0.5">{cookie.desc}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                    cookie.obligatoire
                      ? "bg-[rgba(0,98,51,0.2)] text-green-400 border border-green-900"
                      : "bg-[rgba(107,63,160,0.2)] text-[#c084fc] border border-purple-900"
                  }`}>
                    {cookie.obligatoire ? "Obligatoire" : "Optionnel"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              7. Vos droits
            </h2>
            <p className="mb-3">
              Conformément à la loi n°18-07, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong className="text-white">Droit d'accès</strong> — obtenir une copie de vos données</li>
              <li><strong className="text-white">Droit de rectification</strong> — corriger des données inexactes</li>
              <li><strong className="text-white">Droit de suppression</strong> — demander l'effacement de vos données</li>
              <li><strong className="text-white">Droit d'opposition</strong> — vous opposer au traitement à des fins marketing</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous via le{" "}
              <Link href="/contact" className="underline hover:text-white transition-colors">formulaire de contact</Link>{" "}
              ou sur WhatsApp. Nous répondrons dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              8. Sécurité
            </h2>
            <p>
              TechXpress DZ met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou altération. Le site est hébergé sur l'infrastructure sécurisée de Cloudflare (HTTPS, protection DDoS).
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 flex flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { label: "Mentions légales", href: "/mentions-legales" },
            { label: "CGV", href: "/cgv" },
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
