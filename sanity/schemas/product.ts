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
      validation: (Rule) => Rule.required(),
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
            },
          ],
        },
      ],
      options: { layout: "grid" },
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
    },
    prepare({ title, media, prix, prixPromo, enStock, statut, quantite }) {
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
      return {
        title: `${statutIcon}${title}`,
        media,
        subtitle: `${prixLabel}  ·  ${stockLabel}`,
      };
    },
  },
});
