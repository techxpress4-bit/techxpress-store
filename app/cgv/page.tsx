import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — TechXpress DZ",
  description: "Conditions générales de vente de TechXpress DZ. Paiement à la livraison, livraison dans les 58 wilayas d'Algérie.",
};

export default function CGVPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-10">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-white">Conditions Générales de Vente</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
          Conditions Générales de Vente
        </h1>
        <p className="text-sm text-[#6b7280] mb-12">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-[#9ca3af] text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              1. Objet et champ d'application
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre TechXpress DZ (ci-après « le Vendeur ») et tout client non-professionnel (ci-après « le Client ») effectuant un achat à distance via le site techxpressdz.com. Toute commande implique l'acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              2. Identification du vendeur
            </h2>
            <div className="space-y-2 p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p><span className="text-white font-medium">Raison sociale :</span> TechXpress DZ</p>
              <p><span className="text-white font-medium">RC :</span> 16/00-5150308 A23</p>
              <p><span className="text-white font-medium">NIF :</span> 193161303818169</p>
              <p><span className="text-white font-medium">Adresse :</span> Bab Ezzouar, Alger, Algérie</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              3. Produits
            </h2>
            <p className="mb-3">
              TechXpress DZ propose à la vente les catégories de produits suivantes : Box TV Android, abonnements TV (IPTV), accessoires téléphone, routeurs et modems, câbles, supports TV, et paraboles.
            </p>
            <p>
              Les photographies et descriptions de produits sont fournies à titre indicatif. TechXpress DZ s'engage à proposer des produits conformes à leur description. En cas de non-conformité avérée, le Client dispose des recours prévus à l'article 8 des présentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              4. Prix
            </h2>
            <p className="mb-3">
              Les prix sont affichés en Dinars Algériens (DA), toutes taxes comprises (TTC). TechXpress DZ se réserve le droit de modifier ses prix à tout moment ; les commandes sont facturées au prix en vigueur au moment de la validation.
            </p>
            <div className="p-4 rounded-xl" style={{ background: "rgba(107,63,160,0.08)", border: "1px solid rgba(107,63,160,0.2)" }}>
              <p className="text-white font-medium mb-2">Frais de livraison :</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Alger et environs (Blida, Boumerdès, Tipaza) : à partir de 400 DA</li>
                <li>Nord du pays (autres wilayas côtières) : à partir de 600 DA</li>
                <li>Hauts Plateaux et Sud : à partir de 900 DA</li>
              </ul>
              <p className="mt-2 text-xs text-[#6b7280]">Les frais exacts sont communiqués lors de la confirmation de commande.</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              5. Processus de commande
            </h2>
            <ol className="space-y-3 list-none">
              {[
                "Sélection du/des produit(s) et ajout au panier",
                "Remplissage du formulaire de commande (nom, adresse, wilaya, téléphone)",
                "Validation de la commande — le Client reçoit un récapitulatif",
                "Confirmation téléphonique ou WhatsApp par TechXpress DZ sous 24 heures ouvrables",
                "Préparation et expédition du colis",
                "Livraison et paiement à réception",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--violet)", marginTop: "1px" }}>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4">
              Toute commande non confirmée dans un délai de 48 heures après soumission peut être annulée automatiquement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              6. Paiement
            </h2>
            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(0,98,51,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <span className="text-xl">💵</span>
              <p>
                <span className="text-white font-semibold">Paiement à la livraison uniquement (Cash On Delivery — COD).</span>{" "}
                Aucun paiement en ligne n'est requis. Le règlement s'effectue en espèces au moment de la réception du colis, directement auprès du livreur. TechXpress DZ ne collecte aucune donnée bancaire.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              7. Livraison
            </h2>
            <p className="mb-3">
              TechXpress DZ livre dans l'ensemble des <strong className="text-white">58 wilayas d'Algérie</strong> via des partenaires logistiques agréés.
            </p>
            <ul className="space-y-2 list-disc list-inside mb-3">
              <li>Délai estimatif : 2 à 5 jours ouvrables pour le Nord, 5 à 10 jours pour le Sud</li>
              <li>Un numéro de suivi est communiqué dès l'expédition</li>
              <li>En cas d'absence du Client, un avis de passage est laissé et un second essai effectué</li>
            </ul>
            <p>
              Les délais sont indicatifs et peuvent varier en cas de force majeure ou de perturbation logistique. TechXpress DZ ne saurait être tenu responsable de retards imputables au transporteur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              8. Droit de rétractation et retours
            </h2>
            <p className="mb-3">
              Conformément à la loi algérienne n°18-05 relative au commerce électronique, le Client dispose d'un délai de <strong className="text-white">10 jours calendaires</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motifs.
            </p>
            <p>
              Pour les conditions détaillées de retour, consultez notre{" "}
              <Link href="/politique-retour" className="underline hover:text-white transition-colors">Politique de retour</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              9. Garanties et service après-vente
            </h2>
            <p className="mb-3">
              Tous les produits vendus bénéficient de la garantie légale de conformité prévue par la réglementation algérienne, conformément au décret exécutif n°05-468 du 10 décembre 2005 fixant les conditions et modalités d'application du service après-vente. En cas de défaut constaté à la livraison ou révélé en cours d'utilisation, le Client doit contacter TechXpress DZ en fournissant photos et/ou vidéos du problème dans les meilleurs délais.
            </p>
            <p>
              La garantie ne couvre pas les dommages causés par une mauvaise utilisation, une chute, une exposition à l'humidité, une surtension électrique, ou une modification non autorisée du produit.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              10. Responsabilité
            </h2>
            <p>
              TechXpress DZ ne peut être tenu responsable des dommages indirects résultant de l'utilisation des produits vendus. Sa responsabilité est limitée au montant de la commande concernée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              11. Données personnelles
            </h2>
            <p>
              Les données collectées lors de la commande (nom, adresse, téléphone) sont utilisées exclusivement pour le traitement et la livraison des commandes. Elles ne sont jamais revendues à des tiers. Consultez notre{" "}
              <Link href="/confidentialite" className="underline hover:text-white transition-colors">Politique de confidentialité</Link>{" "}
              pour plus de détails.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              12. Réclamations
            </h2>
            <p>
              Pour toute réclamation, le Client peut contacter TechXpress DZ via WhatsApp ou le{" "}
              <Link href="/contact" className="underline hover:text-white transition-colors">formulaire de contact</Link>. Nous nous engageons à traiter toute réclamation dans un délai de 5 jours ouvrables.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-syne)", color: "var(--violet-light)" }}>
              13. Droit applicable et juridiction
            </h2>
            <p>
              Les présentes CGV sont soumises au droit algérien. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, les tribunaux algériens compétents seront saisis.
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 flex flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { label: "Mentions légales", href: "/mentions-legales" },
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
