import { defineField, defineType } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Produit",
  type: "document",
  icon: () => "🛍️",
  fields: [
    defineField({
      name: "nom",
      title: "Nom du produit",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(120).error("Le nom doit faire entre 3 et 120 caractères"),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "nom", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categorie",
      title: "Catégorie",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required().error("Chaque produit doit appartenir à une catégorie"),
    }),
    defineField({
      name: "photos",
      title: "Photos générales",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Texte alternatif", type: "string" }],
        },
      ],
      options: { layout: "grid" },
      description: "Photos du produit (sans déclinaison spécifique). Si le produit a des déclinaisons avec leur propre photo, ce champ peut rester vide.",
      validation: (Rule) =>
        Rule.custom((photos, ctx) => {
          const doc = ctx.document as { variantes?: { photo?: unknown }[] } | undefined;
          const hasPhotos = Array.isArray(photos) && photos.length > 0;
          const variantesWithPhoto = doc?.variantes?.some((v) => v?.photo) ?? false;
          if (!hasPhotos && !variantesWithPhoto) {
            return "Ajoute au moins une photo (générale OU une photo par déclinaison)";
          }
          return true;
        }),
    }),
    defineField({
      name: "variantes",
      title: "Déclinaisons (couleurs / capacités / modèles)",
      type: "array",
      description:
        "Ajoute une déclinaison par version vendue (ex: AirPods Noir, AirPods Blanc, AirPods Rose). Chaque déclinaison a son propre prix, stock et photo. Pour les variantes qui ne sont PAS des couleurs (ex: 64 Go / 128 Go), laisse le champ Couleur vide — un bouton texte sera affiché à la place de la pastille.",
      of: [
        {
          type: "object",
          name: "variante",
          title: "Déclinaison",
          fields: [
            defineField({
              name: "nom",
              title: "Nom de la déclinaison",
              type: "string",
              description: "Ex: « Noir », « 128 Go », « Taille M », « Modèle Pro »…",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "couleur",
              title: "Couleur (hex, optionnel)",
              type: "string",
              description:
                "Code hex (ex: #1a1a1a) — laisse vide si la déclinaison n'est pas une couleur (capacité, taille, modèle).",
            }),
            defineField({
              name: "prix",
              title: "Prix (DA)",
              type: "number",
              validation: (R) => R.required().positive().error("Le prix doit être > 0"),
            }),
            defineField({
              name: "prixPromo",
              title: "Prix promotionnel de cette déclinaison (DA, optionnel)",
              type: "number",
              description:
                "Promo spécifique à cette déclinaison. Doit être strictement inférieur au prix normal.",
              validation: (R) =>
                R.custom((prixPromo, ctx) => {
                  if (prixPromo === undefined || prixPromo === null) return true;
                  const prix = (ctx.parent as { prix?: number })?.prix;
                  if (typeof prixPromo !== "number" || prixPromo <= 0) return "Doit être > 0";
                  if (typeof prix === "number" && prixPromo >= prix) {
                    return "Doit être strictement inférieur au prix normal";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "dateDebutPromo",
              title: "Date de début de promo de cette déclinaison",
              type: "date",
              description: "La promo de cette variante commence à cette date. Vide = active immédiatement (si prixPromo défini).",
            }),
            defineField({
              name: "dateFinPromo",
              title: "Date de fin de promo de cette déclinaison",
              type: "date",
              description: "La promo de cette variante s'arrête à cette date. Vide = permanente.",
              validation: (R) =>
                R.custom((dateFin, ctx) => {
                  const debut = (ctx.parent as { dateDebutPromo?: string })?.dateDebutPromo;
                  if (dateFin && debut && dateFin < debut) {
                    return "La date de fin doit être après la date de début";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "photo",
              title: "Photo de cette déclinaison",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "enStock",
              title: "En stock",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: "nom",
              prix: "prix",
              prixPromo: "prixPromo",
              couleur: "couleur",
              enStock: "enStock",
              media: "photo",
            },
            prepare({ title, prix, prixPromo, couleur, enStock, media }) {
              const promoActive = !!prixPromo && prix && prixPromo < prix;
              const prixAffiche = promoActive
                ? `${prixPromo.toLocaleString("fr-DZ")} DA (promo, avant ${prix.toLocaleString("fr-DZ")} DA)`
                : prix
                ? `${prix.toLocaleString("fr-DZ")} DA`
                : "Prix non défini";
              const stock = enStock === false ? " • Rupture" : "";
              const colorTag = couleur ? ` • ${couleur}` : "";
              return {
                title: title ?? "Déclinaison",
                subtitle: `${prixAffiche}${colorTag}${stock}`,
                media,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .error("Une description est obligatoire (au moins un paragraphe)"),
    }),
    defineField({
      name: "ficheTechnique",
      title: "Fiche technique",
      description:
        "Tableau de caractéristiques en deux colonnes. Chaque ligne = une paire Caractéristique + Valeur (ex: « Bluetooth » + « 5.4 »). Pour les listes à puces, utilise plutôt la Description.",
      type: "array",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            defineField({
              name: "cle",
              title: "Caractéristique",
              type: "string",
              description: "Nom court (ex: Bluetooth, Résolution, RAM)",
            }),
            defineField({
              name: "valeur",
              title: "Valeur",
              type: "string",
              description: "Valeur correspondante (ex: 5.4, 4K Ultra HD, 2 Go)",
            }),
          ],
          preview: {
            select: { title: "cle", subtitle: "valeur" },
            prepare({ title, subtitle }) {
              return {
                title: title || "⚠️ Caractéristique manquante",
                subtitle: subtitle || "⚠️ Valeur manquante",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "prix",
      title: "Prix (DA)",
      type: "number",
      validation: (Rule) => Rule.required().positive().error("Le prix doit être > 0"),
      description:
        "Prix de vente principal affiché sur la carte produit. Pour une Box TV avec l'option abonnement, c'est le prix de la « Box seule » (sans abonnement). Si le produit a des déclinaisons, le prix de la déclinaison sélectionnée prend le dessus.",
    }),
    defineField({
      name: "prixPromo",
      title: "Prix promotionnel (DA)",
      type: "number",
      description: "Prix réduit affiché à la place du prix normal. Laisser vide si pas de promo.",
      validation: (Rule) =>
        Rule.custom((prixPromo, ctx) => {
          if (prixPromo === undefined || prixPromo === null) return true;
          const prix = (ctx.document as { prix?: number })?.prix;
          if (typeof prixPromo !== "number" || prixPromo <= 0) return "Doit être > 0";
          if (typeof prix === "number" && prixPromo >= prix) {
            return "Doit être strictement inférieur au prix normal";
          }
          return true;
        }),
    }),
    defineField({
      name: "dateDebutPromo",
      title: "Date de début de promotion",
      type: "date",
      description: "La promo commence à cette date. Laisser vide = active immédiatement (si prixPromo défini).",
    }),
    defineField({
      name: "dateFinPromo",
      title: "Date de fin de promotion",
      type: "date",
      description: "La promo s'arrête automatiquement à cette date. Laisser vide = permanente.",
      validation: (Rule) =>
        Rule.custom((dateFin, ctx) => {
          const debut = (ctx.document as { dateDebutPromo?: string })?.dateDebutPromo;
          if (dateFin && debut && dateFin < debut) {
            return "La date de fin doit être après la date de début";
          }
          return true;
        }),
    }),
    defineField({
      name: "prixAvecAbonnement",
      title: "Prix Box + Abonnement (DA)",
      type: "number",
      description: "Prix quand l'option abonnement TV est choisie. Laisser vide si non applicable.",
    }),
    defineField({
      name: "enStock",
      title: "En stock",
      type: "boolean",
      initialValue: true,
      description: "Décocher pour afficher 'Rupture de stock'",
    }),
    defineField({
      name: "optionAbonnement",
      title: "Option abonnement TV disponible",
      type: "boolean",
      initialValue: false,
      description: "Pour les Box TV : affiche le choix Box seule / Box + Abonnement",
    }),
    defineField({
      name: "featured",
      title: "Produit vedette",
      type: "boolean",
      initialValue: false,
      description: "Afficher sur la page d'accueil dans Best Sellers (fallback si Best Sellers singleton est vide)",
    }),
    defineField({
      name: "nouveaute",
      title: "Badge \"Nouveau\"",
      type: "boolean",
      initialValue: false,
      description: "Affiche le badge vert « Nouveau » sur la carte produit",
    }),
    defineField({
      name: "marque",
      title: "Marque / Fabricant",
      type: "string",
      description: "Ex: Xiaomi, Samsung, TP-Link, Décodeur Android…",
      validation: (Rule) => Rule.required().error("La marque est requise pour le SEO + conformité"),
    }),
    defineField({
      name: "garantie",
      title: "Durée de garantie (mois)",
      type: "number",
      description: "Ex: 12, 24. Optionnel.",
    }),
    defineField({
      name: "reference",
      title: "Référence / SKU",
      type: "string",
      description: "Référence interne du produit pour la gestion de stock",
    }),
  ],
  orderings: [
    { title: "Prix croissant", name: "prixAsc", by: [{ field: "prix", direction: "asc" }] },
    { title: "Prix décroissant", name: "prixDesc", by: [{ field: "prix", direction: "desc" }] },
    { title: "Nouveaux en premier", name: "dateDesc", by: [{ field: "_createdAt", direction: "desc" }] },
  ],
  preview: {
    select: {
      title: "nom",
      media: "photos.0",
      varMedia: "variantes.0.photo",
      prix: "prix",
      enStock: "enStock",
      photoKey: "photos.0._key",
      photoAsset: "photos.0.asset._ref",
      varPhotoAsset: "variantes.0.photo.asset._ref",
      descKey: "description.0._key",
      marque: "marque",
      garantie: "garantie",
    },
    prepare({ title, media, varMedia, prix, enStock, photoKey, photoAsset, varPhotoAsset, descKey, marque, garantie }) {
      const hasPhoto = !!photoKey || !!photoAsset || !!varPhotoAsset;
      const hasDesc = !!descKey;
      const missing: string[] = [];
      if (!hasPhoto) missing.push("photo");
      if (!hasDesc) missing.push("description");
      if (!marque) missing.push("marque");
      if (typeof prix !== "number" || prix <= 0) missing.push("prix");

      const stockTag = enStock === false ? "❌ Rupture" : "✅ En stock";
      const prixTag = typeof prix === "number" && prix > 0
        ? `${prix.toLocaleString("fr-DZ")} DA`
        : "⚠️ Pas de prix";
      const subtitle = missing.length
        ? `⚠️ Incomplet — manque: ${missing.join(", ")}`
        : `${prixTag} • ${stockTag}${marque ? ` • ${marque}` : ""}`;

      return {
        title: missing.length ? `⚠️ ${title}` : title,
        media: media || varMedia,
        subtitle,
      };
    },
  },
});
