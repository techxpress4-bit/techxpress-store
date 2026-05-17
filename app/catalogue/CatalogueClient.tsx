"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "nouveau";

interface Props {
  products: Product[];
  categories: Category[];
}

export default function CatalogueClient({ products, categories }: Props) {
  const [sort, setSort] = useState<SortOption>("default");
  const [searchQ, setSearchQ] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("q") || "";
    }
    return "";
  });
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const sortedProducts = useMemo(() => {
    let filtered = [...products];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(q) ||
        p.categorie?.nom?.toLowerCase().includes(q)
      );
    }
    if (maxPrice > 0) {
      filtered = filtered.filter(p => p.prix <= maxPrice);
    }
    switch (sort) {
      case "price-asc": return filtered.sort((a, b) => a.prix - b.prix);
      case "price-desc": return filtered.sort((a, b) => b.prix - a.prix);
      case "name-asc": return filtered.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      case "nouveau": return filtered.sort((a, b) => (b.nouveaute ? 1 : 0) - (a.nouveaute ? 1 : 0));
      default: return filtered;
    }
  }, [products, sort, searchQ, maxPrice]);

  const maxProductPrice = Math.max(...products.map(p => p.prix), 0);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--violet-light)" }}>
            Catalogue complet
          </p>
          <h1 className="section-title mb-2">Tous nos produits</h1>
          <p className="text-[#6b7280]">
            {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide flex-shrink-0">Trier :</span>
          {([
            ["default", "Par défaut"],
            ["price-asc", "Prix ↑"],
            ["price-desc", "Prix ↓"],
            ["name-asc", "A → Z"],
            ["nouveau", "Nouveautés"],
          ] as [SortOption, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={sort === value ? {
                background: "rgba(107,63,160,0.2)",
                border: "1px solid rgba(107,63,160,0.4)",
                color: "#c084fc",
              } : {
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              {label}
            </button>
          ))}
          {maxProductPrice > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[#6b7280]">Max :</span>
              <input
                type="range"
                min={0}
                max={maxProductPrice}
                step={1000}
                value={maxPrice || maxProductPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-[#6b3fa0]"
              />
              <span className="text-xs text-white font-medium w-20">
                {maxPrice > 0 && maxPrice < maxProductPrice ? `${maxPrice.toLocaleString("fr-DZ")} DA` : "Tout"}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
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
                  const count = products.filter(p => p.categorie?.slug?.current === cat.slug.current).length;
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

          <div className="flex-1">
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedProducts.map((product) => (
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
                  Aucun produit trouvé
                </h3>
                <p className="text-[#6b7280] text-sm max-w-sm">
                  {searchQ ? `Aucun résultat pour "${searchQ}"` : "Revenez bientôt."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
