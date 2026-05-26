import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool, defineLocations } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemas } from "./sanity/schemas";
import { productActions } from "./sanity/actions/productActions";

const SITE_URL = "https://techxpressdz.com";

export default defineConfig({
  name: "techxpress",
  title: "Tech Xpress — Back Office",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gdccl23z",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Tech Xpress")
          .items([

            // ── PRODUITS ──────────────────────────────────────────────────
            S.listItem()
              .title("🛍️  Produits")
              .child(
                S.list()
                  .title("Produits")
                  .items([
                    S.listItem()
                      .title("Tous les produits")
                      .child(
                        S.documentTypeList("product")
                          .title("Tous les produits")
                          .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
                      ),
                    S.divider(),
                    S.listItem()
                      .title("⭐  Best Sellers (ordre & sélection)")
                      .id("bestSellers")
                      .child(
                        S.document()
                          .schemaType("bestSellers")
                          .documentId("bestSellers")
                          .title("Best Sellers")
                      ),
                    S.listItem()
                      .title("🏷️  Produits vedettes (filtré)")
                      .child(
                        S.documentList()
                          .title("Produits vedettes")
                          .filter('_type == "product" && featured == true')
                          .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
                      ),
                    S.listItem()
                      .title("🆕  Nouveautés")
                      .child(
                        S.documentList()
                          .title("Nouveautés")
                          .filter('_type == "product" && nouveaute == true')
                          .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
                      ),
                    S.listItem()
                      .title("📺  Box avec abonnement")
                      .child(
                        S.documentList()
                          .title("Box avec option abonnement")
                          .filter('_type == "product" && optionAbonnement == true')
                          .defaultOrdering([{ field: "prix", direction: "asc" }])
                      ),
                    S.divider(),
                    S.listItem()
                      .title("❌  Ruptures de stock")
                      .child(
                        S.documentList()
                          .title("Ruptures de stock")
                          .filter('_type == "product" && enStock == false')
                          .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                      ),
                  ])
              ),

            S.divider(),

            // ── CATÉGORIES ────────────────────────────────────────────────
            S.listItem()
              .title("📦  Catégories")
              .child(
                S.documentTypeList("category")
                  .title("Catégories")
                  .defaultOrdering([{ field: "ordre", direction: "asc" }])
              ),

          ]),
    }),
    presentationTool({
      title: "Preview",
      previewUrl: {
        origin: SITE_URL,
      },
      resolve: {
        locations: {
          product: defineLocations({
            select: { nom: "nom", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.nom || "Produit",
                  href: doc?.slug ? `/produit/${doc.slug}` : "/",
                },
                { title: "Accueil", href: "/" },
                { title: "Catalogue", href: "/catalogue" },
              ],
            }),
          }),
          category: defineLocations({
            select: { nom: "nom", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.nom || "Catégorie",
                  href: doc?.slug ? `/catalogue/${doc.slug}` : "/catalogue",
                },
                { title: "Catalogue", href: "/catalogue" },
                { title: "Accueil", href: "/" },
              ],
            }),
          }),
          bestSellers: defineLocations({
            select: { _id: "_id" },
            resolve: () => ({
              locations: [{ title: "Accueil", href: "/" }],
            }),
          }),
        },
      },
    }),
    visionTool(),
  ],
  document: {
    actions: (prev, ctx) =>
      ctx.schemaType === "product" ? [...prev, ...productActions] : prev,
  },
  schema: { types: schemas },
});
