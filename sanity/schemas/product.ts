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
      validation: (Rule) => Rule.required(),
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
      validation: (Rule) => Rule.required(),
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
      description: "Photos du produit (sans déclinaison spécifique). Si le produit a des déclinaisons, laisse vide — chaque déclinaison a sa propre photo.",
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
              validation: (R) => R.required().min(0),
            }),
            defineField({
              name: "prixPromo",
              title: "Prix promotionnel de cette déclinaison (DA, optionnel)",
              type: "number",
              description:
                "Promo spécifique à cette déclinaison uniquement. Laisser vide si pas de promo sur cette variante.",
            }),
            defineField({
              name: "dateFinPromo",
              title: "Date de fin de promo de cette déclinaison",
              type: "date",
              description: "La promo de cette variante s'arrête à cette date. Vide = promo permanente.",
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
    }),
    defineField({
      name: "ficheTechnique",
      title: "Fiche technique",
      type: "array",
      of: [
        {
          type: "object",
          name: "spec",
          fields: [
            defineField({ name: "cle", title: "Caractéristique", type: "string" }),
            defineField({ name: "valeur", title: "Valeur", type: "string" }),
          ],
          preview: {
            select: { title: "cle", subtitle: "valeur" },
          },
        },
      ],
    }),
    defineField({
      name: "prix",
      title: "Prix (DA)",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      description:
        "Prix de vente principal affiché sur la carte produit. Pour une Box TV avec l'option abonnement cochée plus bas, c'est le prix de la « Box seule » (sans abonnement). Si le produit a des déclinaisons, le prix de la déclinaison sélectionnée prend le dessus au moment de l'ajout au panier.",
    }),
    defineField({
      name: "prixPromo",
      title: "Prix promotionnel (DA)",
      type: "number",
      description: "Prix réduit affiché à la place du prix normal. Laisser vide si pas de promo.",
    }),
    defineField({
      name: "dateFinPromo",
      title: "Date de fin de promotion",
      type: "date",
      description: "La promo s'arrête automatiquement à cette date. Laisser vide = promo permanente.",
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
      description: "Afficher sur la page d'accueil dans Best Sellers",
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
    }),
    defineField({
      name: "garantie",
      title: "Durée de garantie (mois)",
      type: "number",
      description: "Durée de la garantie en mois. Requis par le décret 05-468 SAV. Ex: 12, 24",
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: "reference",
      title: "Référence / SKU",
      type: "string",
      description: "Référence interne du produit pour la gestion de stock",
    }),
  ],
  orderings: [
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
      title: "Nouveaux en premier",
      name: "dateDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "nom",
      media: "photos.0",
      prix: "prix",
      enStock: "enStock",
    },
    prepare({ title, media, prix, enStock }) {
      return {
        title,
        media,
        subtitle: `${prix ? `${prix.toLocaleString("fr-DZ")} DA` : "Prix non défini"} ${enStock === false ? "• Rupture" : "• En stock"}`,
      };
    },
  },
});
