import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemas } from "@/sanity/schemas";

export default defineConfig({
  name: "techxpress",
  title: "Tech Xpress — Back Office",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Tech Xpress")
          .items([
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
                    S.listItem()
                      .title("⭐  Produits vedettes")
                      .child(
                        S.documentList()
                          .title("Produits vedettes")
                          .filter('_type == "product" && featured == true')
                      ),
                    S.listItem()
                      .title("❌  Ruptures de stock")
                      .child(
                        S.documentList()
                          .title("Ruptures de stock")
                          .filter('_type == "product" && enStock == false')
                      ),
                  ])
              ),
            S.divider(),
            S.listItem()
              .title("📦  Catégories")
              .child(
                S.documentTypeList("category")
                  .title("Catégories")
                  .defaultOrdering([{ field: "ordre", direction: "asc" }])
              ),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemas },
  basePath: "/studio",
});
