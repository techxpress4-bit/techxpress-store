import { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/lib/sanity";
import { allProductsQuery, allCategoriesQuery } from "@/lib/queries";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Tous nos produits électroniques : Box TV Android, accessoires téléphone, routeurs, câbles, paraboles et plus.",
};

export default async function CataloguePage() {
  const [products, categories] = await Promise.all([
    sanityFetch<Product[]>(allProductsQuery),
    sanityFetch<Category[]>(allCategoriesQuery),
  ]);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--violet-light)" }}>
            Catalogue complet
          </p>
          <h1 className="section-title mb-2">Tous nos produits</h1>
          <p className="text-[#6b7280]">
            {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="text-sm font-bold text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                Catégories
              </h3>
              <nav className="space-y-1">
                <Link
                  href="/catalogue"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
                  style={{ background: "rgba(107,63,160,0.2)", border: "1px solid rgba(107,63,160,0.3)" }}
                >
                  Tous les produits
                  <span className="text-xs text-[#9ca3af]">{products.length}</span>
                </Link>
                {categories.map((cat) => {
                  const count = products.filter(
                    (p) => p.categorie?.slug?.current === cat.slug.current
                  ).length;
                  return (
                    <Link
                      key={cat._id}
                      href={`/catalogue/${cat.slug.current}`}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                    >
                      {cat.nom}
                      <span className="text-xs text-[#4b5563]">{count}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <svg className="w-10 h-10 text-[#4b5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "var(--font-syne)" }}>
                  Catalogue en préparation
                </h3>
                <p className="text-[#6b7280] text-sm max-w-sm">
                  Les produits seront bientôt disponibles. Configurez votre Sanity Studio pour ajouter des produits.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
