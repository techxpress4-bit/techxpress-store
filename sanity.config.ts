import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemas } from "./sanity/schemas";

export default defineConfig({
  name: "techxpress",
  title: "Tech Xpress — Back Office",
  projectId: "gdccl23z",
  dataset: "production",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Tech Xpress")
          .items([

            // ── PRODUITS ──────────────────────────────────
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

                    // Gestion des stocks
                    S.listItem()
                      .title("📦  Gestion des stocks")
                      .child(
                        S.list()
                          .title("Gestion des stocks")
                          .items([
                            S.listItem()
                              .title("✅  En stock")
                              .child(
                                S.documentList()
                                  .title("En stock")
                                  .filter('_type == "product" && enStock == true')
                                  .defaultOrdering([{ field: "nom", direction: "asc" }])
                              ),
                            S.listItem()
                              .title("🔴  Ruptures de stock")
                              .child(
                                S.documentList()
                                  .title("Ruptures de stock")
                                  .filter('_type == "product" && enStock == false')
                                  .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                              ),
                          ])
                      ),

                    S.divider(),

                    // Statuts de publication
                    S.listItem()
                      .title("📋  Par statut")
                      .child(
                        S.list()
                          .title("Par statut")
                          .items([
                            S.listItem()
                              .title("🟢  Publiés")
                              .child(
                                S.documentList()
                                  .title("Produits publiés")
                                  .filter('_type == "product" && (statut == "publie" || !defined(statut))')
                                  .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
                              ),
                            S.listItem()
                              .title("📝  Brouillons")
                              .child(
                                S.documentList()
                                  .title("Brouillons")
                                  .filter('_type == "product" && statut == "brouillon"')
                                  .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                              ),
                            S.listItem()
                              .title("🗃️  Archivés")
                              .child(
                                S.documentList()
                                  .title("Produits archivés")
                                  .filter('_type == "product" && statut == "archive"')
                                  .defaultOrdering([{ field: "_updatedAt", direction: "desc" }])
                              ),
                          ])
                      ),

                    S.divider(),

                    // Mise en avant
                    S.listItem()
                      .title("⭐  Produits vedettes")
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

                  ])
              ),

            S.divider(),

            // ── CATÉGORIES ────────────────────────────────
            S.listItem()
              .title("📁  Catégories")
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
