import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de retour — TechXpress DZ",
  description: "Conditions de retour et de remboursement chez TechXpress DZ. 10 jours calendaires pour retourner votre produit.",
};

export default function PolitiqueRetourPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-10">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-white">Politique de retour</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
          Politique de retour
        </h1>
        <p className="text-sm text-[#6b7280] mb-12">Dernière mise à jour : mai 2026</p>

        {/* Highlight box */}
        <div className="flex items-start gap-4 p-5 rounded-2xl mb-12"
          style={{ background: "rgba(107,63,160,0.08)", border: "1px solid rgba(107,63,160,0.25)" }}>
          <span className="text-2xl flex-shrink-0">📦</span>
          <div>
            <p className="text-white font-semibold mb-1">10 jours pour changer d'avis</p>
            <p className="text-sm text-[#9ca3af]">
              Conformément à la loi algérienne n°18-05 relative au commerce électronique, vous disposez de 10 jours calendaires à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à vous justifier.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-[#9ca3af] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              1. Délai de rétractation
            </h2>
            <p>
              Le délai de 10 jours calendaires court à compter du lendemain de la réception du produit. S'il expire un vendredi ou un jour férié algérien, il est prolongé jusqu'au prochain jour ouvrable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              2. Conditions d'acceptation du retour
            </h2>
            <p className="mb-4">Pour être accepté, le produit retourné doit être :</p>
            <ul className="space-y-2">
              {[
                "Non utilisé et en parfait état de fonctionnement",
                "Dans son emballage d'origine intact (boîte, plastiques, étiquettes)",
                "Accompagné de tous ses accessoires (câbles, télécommande, notices, garantie)",
                "Sans trace d'usure, rayure ou dommage d'origine client",
              ].map((condition, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green-900 border border-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{condition}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              3. Produits exclus du droit de retour
            </h2>
            <p className="mb-4">Le droit de rétractation ne s'applique pas aux produits suivants :</p>
            <ul className="space-y-2">
              {[
                "Abonnements TV / IPTV (une fois activés)",
                "Logiciels et licences une fois descellés ou activés",
                "Produits descellés pour des raisons d'hygiène ou de sécurité",
                "Articles personnalisés ou configurés à la demande du client",
                "Produits endommagés par le client (chute, mauvaise utilisation, infiltration)",
              ].map((exclusion, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-900 border border-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <span>{exclusion}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              4. Procédure de retour
            </h2>
            <ol className="space-y-4 list-none">
              {[
                { step: "Contactez-nous", desc: "Via WhatsApp ou le formulaire de contact avec votre numéro de commande et la raison du retour." },
                { step: "Confirmation", desc: "TechXpress DZ vous confirme la prise en charge dans un délai de 48 heures ouvrables et vous communique l'adresse d'expédition." },
                { step: "Renvoi du produit", desc: "Expédiez le produit soigneusement emballé à l'adresse indiquée. Conservez votre preuve d'envoi." },
                { step: "Vérification", desc: "À réception, TechXpress DZ vérifie l'état du produit dans un délai de 5 jours ouvrables." },
                { step: "Remboursement", desc: "Un avoir sur votre prochain achat est émis immédiatement après validation, utilisable sans limite de durée." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--violet)" }}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white font-semibold mb-1">{item.step}</p>
                    <p>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              5. Frais de retour
            </h2>
            <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#111] text-xs">
                <p>Retour suite à un changement d'avis</p>
                <span className="text-red-400 font-medium flex-shrink-0">À la charge du client</span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#161616] text-xs">
                <p>Produit défectueux ou non-conforme à la description</p>
                <span className="text-green-400 font-medium flex-shrink-0">Pris en charge par TechXpress DZ</span>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[#111] text-xs">
                <p>Erreur de préparation de commande</p>
                <span className="text-green-400 font-medium flex-shrink-0">Pris en charge par TechXpress DZ</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              6. Remboursement
            </h2>
            <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="mb-3">
                Le remboursement s'effectue sous la forme d'un <strong className="text-white">avoir sur votre prochain achat</strong>, valable sans limite de durée sur techxpressdz.com.
              </p>
              <p className="mb-3">
                L'avoir est émis dans un délai maximum de <strong className="text-white">14 jours</strong> après réception et validation du produit retourné.
              </p>
              <p className="text-xs text-[#6b7280]">
                Les frais de livraison initiaux ne sont remboursés qu'en cas d'erreur de notre part (produit défectueux ou non-conforme).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              7. Garantie légale de conformité
            </h2>
            <p>
              Indépendamment du droit de rétractation, tous les produits bénéficient de la garantie légale de conformité contre les défauts de fabrication. Si votre produit présente un défaut, contactez-nous avec photos ou vidéos du problème dans les plus brefs délais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              8. Contact
            </h2>
            <p>
              Pour initier un retour ou pour toute question, contactez-nous via WhatsApp ou le{" "}
              <Link href="/contact" className="underline hover:text-white transition-colors">formulaire de contact</Link>.
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 flex flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { label: "Mentions légales", href: "/mentions-legales" },
            { label: "CGV", href: "/cgv" },
            { label: "Confidentialité", href: "/confidentialite" },
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
