import { defineField, defineType } from "sanity";

export const settingsSchema = defineType({
  name: "settings",
  title: "Paramètres boutique",
  type: "document",
  icon: () => "⚙️",
  fields: [
    defineField({
      name: "nomSite",
      title: "Nom du site",
      type: "string",
      initialValue: "TechXpressDZ",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "telephone",
      title: "Numéro WhatsApp",
      type: "string",
      description: "Format international sans espaces. Ex: +213XXXXXXXXX",
      validation: (Rule) =>
        Rule.regex(/^\+[0-9]{8,15}$/, {
          name: "format international",
        }).warning("Format attendu: +213XXXXXXXXX"),
    }),
    defineField({
      name: "adresseEmail",
      title: "Email de contact",
      type: "string",
      description: "Affiché dans les footers d'emails et la page Contact",
    }),
    defineField({
      name: "banniere",
      title: "Bannière promotionnelle",
      type: "object",
      description: "Bandeau affiché en haut du site",
      fields: [
        defineField({
          name: "active",
          title: "Activée",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "texte",
          title: "Texte",
          type: "string",
          description: "Ex: 🚚 Livraison gratuite dès 5 000 DA",
        }),
        defineField({
          name: "lien",
          title: "Lien (optionnel)",
          type: "string",
          description: "URL interne ou externe. Ex: /catalogue",
        }),
      ],
    }),
    defineField({
      name: "fraisLivraison",
      title: "Frais de livraison (DA)",
      type: "number",
      description: "Montant standard affiché dans les emails de confirmation",
      initialValue: 0,
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: "mentionCOD",
      title: "Mention paiement à la livraison",
      type: "string",
      description: "Texte affiché sur la page de commande sous le bouton Commander",
      initialValue: "Paiement à la livraison (COD) — payez en cash à la réception",
    }),
    defineField({
      name: "reseauxSociaux",
      title: "Réseaux sociaux",
      type: "object",
      fields: [
        defineField({ name: "facebook",  title: "Facebook",  type: "url" }),
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "tiktok",    title: "TikTok",    type: "url" }),
      ],
    }),
  ],
  preview: {
    select: { title: "nomSite", subtitle: "telephone" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Paramètres boutique",
        subtitle: subtitle || "Cliquer pour configurer",
      };
    },
  },
});
