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
      title: "Slug",
      type: "slug",
      options: { source: "nom", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icone",
      title: "Icône (emoji)",
      type: "string",
      description: "Ex: 📺 🔌 📱",
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
    }),
  ],
  preview: {
    select: { title: "nom", icone: "icone" },
    prepare({ title, icone }) {
      return { title: `${icone || "📦"} ${title}` };
    },
  },
});
