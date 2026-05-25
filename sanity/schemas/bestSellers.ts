import { defineField, defineType } from "sanity";

export const bestSellersSchema = defineType({
  name: "bestSellers",
  title: "Best Sellers",
  type: "document",
  icon: () => "⭐",
  fields: [
    defineField({
      name: "produits",
      title: "Produits affichés (glisser pour réordonner)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      description: "Ajoute ou retire des produits, et glisse-dépose pour changer l'ordre d'affichage.",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Best Sellers" };
    },
  },
});
