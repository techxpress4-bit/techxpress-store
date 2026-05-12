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
      title: "Photos",
      type: "array",
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
