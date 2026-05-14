import { defineConfig } from "sanity";
import { structureTool } from "sanity/plugins/structure";
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
              .title("Produits")
              .icon(() => "🛍️")
              .child(S.documentTypeList("product").title("Tous les produits")),
            S.listItem()
              .title("Catégories")
              .icon(() => "📦")
              .child(S.documentTypeList("category").title("Catégories")),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemas },
  basePath: "/studio",
});
