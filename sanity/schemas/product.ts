import { defineField, defineType } from "sanity";

export const productSchema = defineType({
  name: "product",
  title: "Produit",
  type: "document",
  icon: () => "🛍️",

  groups: [
    { name: "details",    title: "Détails",      default: true },
    { name: "stock",      title: "Stock & Prix"               },
    { name: "media",      title: "Médias"                     },
    { name: "contenu",    title: "Contenu"                    },
    { name: "parametres", title: "Paramètres"                 },
    { name: "seo",        title: "SEO"                        },
  ],

  fields: [
    // ── Détails ───────────────────────────────────────────
    defineField({
      name: "nom",
      title: "Nom du produit",
      type: "string",
      group: "details",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "details",
      options: { source: "nom", maxLength: 96 },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          if (!slug?.current) return true;
          const { document, getClient } = context as any;
          const client = getClient({ apiVersion: "2024-01-01" });
          const id = (document?._id ?? "").replace(/^drafts\./, "");
          const count = (await client.fetch(
            `count(*[_type == "product" && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
            { slug: slug.current, id }
          )) as number;
          return count === 0 ? true : "Ce slug est déjà utilisé par un autre produit";
        }),
    }),
    defineField({
      name: "categorie",
      title: "Catégorie",
      type: "reference",
      group: "details",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "marque",
      title: "Marque / Fabricant",
      type: "string",
      group: "details",
      description: "Ex: Samsung, Apple, Xiaomi. Utilisé pour le SEO et les filtres.",
    }),
    defineField({
      name: "statut",
      title: "Statut de publication",
      type: "string",
      group: "details",
      options: {
        list: [
          { title: "✅  Publié — visible sur le site",    value: "publie"    },
          { title: "📝  Brouillon — non visible",         value: "brouillon" },
          { title: "🗃️  Archivé — retiré du catalogue",   value: "archive"   },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "publie",
      validation: (Rule) => Rule.required(),
    }),

    // ── Stock & Prix ──────────────────────────────────────
    defineField({
      name: "prix",
      title: "Prix (DA)",
      type: "number",
      group: "stock",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "prixPromo",
      title: "Prix promotionnel (DA) — optionnel",
      type: "number",
      group: "stock",
      description: "Si renseigné, le prix barré sera affiché à côté du prix promo.",
      validation: (Rule) =>
        Rule.custom((prixPromo, ctx) => {
          const prix = (ctx.document as { prix?: number })?.prix;
          if (prixPromo && prix && prixPromo >= prix)
            return "Le prix promo doit être inférieur au prix normal";
          return true;
        }),
    }),
    defineField({
      name: "dateFinPromo",
      title: "Date de fin de promo (optionnel)",
      type: "date",
      group: "stock",
      description: "Si renseigné, la promo s'arrête automatiquement à cette date. Laisser vide = promo permanente.",
      options: { dateFormat: "DD/MM/YYYY" },
    }),
    defineField({
      name: "prixAvecAbonnement",
      title: "Prix Box + Abonnement TV (DA)",
      type: "number",
      group: "stock",
      description: "Affiché uniquement si « Option abonnement TV » est activée.",
      hidden: ({ document }) => !document?.optionAbonnement,
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          const doc = ctx.document as { optionAbonnement?: boolean; prix?: number };
          if (doc?.optionAbonnement && !val) return "Requis quand l'option abonnement est activée";
          return true;
        }),
    }),
    defineField({
      name: "enStock",
      title: "En stock",
      type: "boolean",
      group: "stock",
      initialValue: true,
      description: "Décocher pour afficher « Rupture de stock »",
    }),
    defineField({
      name: "stockQuantite",
      title: "Quantité en stock",
      type: "number",
      group: "stock",
      description: "Usage interne — non affiché sur le site.",
      validation: (Rule) => Rule.min(0).integer(),
    }),

    // ── Médias ────────────────────────────────────────────
    defineField({
      name: "photos",
      title: "Photos",
      type: "array",
      group: "media",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Texte alternatif",
              type: "string",
              validation: (Rule: any) =>
                Rule.warning("Ajoutez un alt text pour améliorer le référencement et l'accessibilité."),
            },
          ],
        },
      ],
      options: { layout: "grid" },
      validation: (Rule) =>
        Rule.min(1).warning("Ajoutez au moins 1 photo pour que le produit s'affiche correctement"),
    }),

    // ── Contenu ───────────────────────────────────────────
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      group: "contenu",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "ficheTechnique",
      title: "Fiche technique",
      type: "array",
      group: "contenu",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            defineField({ name: "cle",    title: "Caractéristique", type: "string" }),
            defineField({ name: "valeur", title: "Valeur",           type: "string" }),
          ],
          preview: {
            select: { title: "cle", subtitle: "valeur" },
          },
        },
      ],
    }),

    // ── SEO ───────────────────────────────────────────────
    defineField({
      name: "metaTitre",
      title: "Titre SEO personnalisé",
      type: "string",
      group: "seo",
      description: "Laissez vide pour utiliser le nom du produit. Max 60 caractères.",
      validation: (Rule) => Rule.max(60).warning("Idéalement ≤ 60 caractères pour Google"),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 2,
      group: "seo",
      description: "Résumé affiché dans les résultats Google. Max 155 caractères.",
      validation: (Rule) => Rule.max(155).warning("Idéalement ≤ 155 caractères"),
    }),

    // ── Paramètres ────────────────────────────────────────
    defineField({
      name: "featured",
      title: "⭐ Produit vedette",
      type: "boolean",
      group: "parametres",
      initialValue: false,
      description: "Affiche ce produit dans la section Best Sellers de la page d'accueil",
    }),
    defineField({
      name: "nouveaute",
      title: "🆕 Badge \"Nouveau\"",
      type: "boolean",
      group: "parametres",
      initialValue: false,
      description: "Affiche le badge vert « Nouveau » sur la carte produit",
    }),
    defineField({
      name: "optionAbonnement",
      title: "📺 Option abonnement TV",
      type: "boolean",
      group: "parametres",
      initialValue: false,
      description: "Pour les Box TV : affiche le choix Box seule / Box + Abonnement",
    }),
    defineField({
      name: "ordre",
      title: "Ordre d'affichage",
      type: "number",
      group: "parametres",
      description: "Laissez vide pour l'ordre par défaut (date). 1 = affiché en premier dans le catalogue.",
      validation: (Rule) => Rule.min(1).integer().warning("Entier positif (ex: 1, 2, 3…)"),
    }),
  ],

  orderings: [
    {
      title: "Nouveaux en premier",
      name: "dateDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Prix croissant",
      name: "prixAsc",
      by: [{ field: "prix", direction: "asc" }],
    },
    {
      title: "Prix décroissant",
      name: "prixDesc",
      by: [{ field: "prix", direction: "desc" }],
    },
    {
      title: "Nom A → Z",
      name: "nomAsc",
      by: [{ field: "nom", direction: "asc" }],
    },
  ],

  preview: {
    select: {
      title:    "nom",
      media:    "photos.0",
      prix:     "prix",
      prixPromo:"prixPromo",
      enStock:  "enStock",
      statut:   "statut",
      quantite: "stockQuantite",
      marque:   "marque",
    },
    prepare({ title, media, prix, prixPromo, enStock, statut, quantite, marque }) {
      const statutIcon =
        statut === "brouillon" ? "📝 " :
        statut === "archive"   ? "🗃️ " : "";
      const prixLabel = prixPromo
        ? `${prixPromo.toLocaleString("fr-DZ")} DA (promo)`
        : prix
        ? `${prix.toLocaleString("fr-DZ")} DA`
        : "Prix non défini";
      const stockLabel =
        enStock === false ? "🔴 Rupture" :
        quantite != null  ? `✅ ${quantite} en stock` :
        "✅ En stock";
      const marqueLabel = marque ? ` · ${marque}` : "";
      return {
        title: `${statutIcon}${title}`,
        media,
        subtitle: `${prixLabel}  ·  ${stockLabel}${marqueLabel}`,
      };
    },
  },
});
