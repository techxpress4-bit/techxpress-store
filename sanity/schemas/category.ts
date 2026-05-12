import { defineField, defineType } from "sanity";

export const categorySchema = defineType({
  name: "category",
  title: "Catégorie",
  type: "document",
  icon: () => "📦",
  fields: [
    defineField({
      name: "nom",
      title: "Nom",
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
      name: "image",
      title: "Image de la catégorie",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texte alternatif",
          type: "string",
          description: "Description de l'image pour l'accessibilité",
        }),
      ],
    }),
    defineField({
      name: "icone",
      title: "Icône (emoji) — fallback",
      type: "string",
      description: "Affiché si aucune image n'est définie. Ex: 📺 🔌 📱",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ordre",
      title: "Ordre d'affichage",
      type: "number",
      initialValue: 0,
      description: "1 = affiché en premier dans le carousel",
    }),
  ],
  preview: {
    select: { title: "nom", media: "image", icone: "icone" },
    prepare({ title, media, icone }) {
      return {
        title,
        media: media || undefined,
        subtitle: icone || "📦",
      };
    },
  },
});
