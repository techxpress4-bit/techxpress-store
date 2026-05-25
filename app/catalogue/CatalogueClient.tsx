"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "nouveau";

const sortLabels: Record<SortOption, string> = {
  default: "Par défaut",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  "name-asc": "A → Z",
  nouveau: "Nouveautés",
};

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
  const maxProductPrice = Math.max(...products.map((p) => p.prix), 0);
  const [maxPrice, setMaxPrice] = useState<number>(0); // 0 = pas de filtre (slider au max)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    }
    if (filtersOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filtersOpen]);

  const sortedProducts = useMemo(() => {
    let filtered = [...products];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      filtered = filtered.filter((p) =>
        p.nom.toLowerCase().includes(q) ||
        p.categorie?.nom?.toLowerCase().includes(q)
      );
    }
    if (maxPrice > 0 && maxPrice < maxProductPrice) {
      filtered = filtered.filter((p) => p.prix <= maxPrice);
    }
    switch (sort) {
      case "price-asc": return filtered.sort((a, b) => a.prix - b.prix);
      case "price-desc": return filtered.sort((a, b) => b.prix - a.prix);
      case "name-asc": return filtered.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      case "nouveau": return filtered.sort((a, b) => (b.nouveaute ? 1 : 0) - (a.nouveaute ? 1 : 0));
      default: return filtered;
    }
  }, [products, sort, searchQ, maxPrice, maxProductPrice]);

  const activeFilterCount = [
    sort !== "default",
    maxPrice > 0 && maxPrice < maxProductPrice,
  ].filter(Boolean).length;

  const sliderValue = maxPrice > 0 ? maxPrice : maxProductPrice;

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

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-8">
          {/* Dropdown Filtres & Tri */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filtersOpen || activeFilterCount > 0 ? "rgba(107,63,160,0.15)" : "var(--surface)",
                border: `1px solid ${filtersOpen || activeFilterCount > 0 ? "rgba(107,63,160,0.4)" : "var(--border)"}`,
                color: filtersOpen || activeFilterCount > 0 ? "#c084fc" : "var(--text-secondary)",
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Trier &amp; Filtrer
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: "var(--violet)" }}>
                  {activeFilterCount}
                </span>
              )}
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {filtersOpen && (
              <div
                className="absolute left-0 top-full mt-2 z-40 w-72 rounded-2xl shadow-2xl shadow-black/60 p-5 space-y-5"
                style={{ background: "var(--card)", border: "1px solid rgba(107,63,160,0.25)" }}
              >
                {/* Tri */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Trier par</p>
                  <div className="flex flex-col gap-1.5">
                    {(Object.entries(sortLabels) as [SortOption, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => { setSort(value); }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
                        style={sort === value ? {
                          background: "rgba(107,63,160,0.2)",
                          color: "#c084fc",
                        } : {
                          color: "var(--text-secondary)",
                        }}
                      >
                        {label}
                        {sort === value && (
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prix */}
                {maxProductPrice > 0 && (
                  <div>
                    <div className="h-px mb-4" style={{ background: "var(--border)" }} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Prix maximum</p>
                    <input
                      type="range"
                      min={0}
                      max={maxProductPrice}
                      step={1000}
                      value={sliderValue}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setMaxPrice(v >= maxProductPrice ? 0 : v);
                      }}
                      className="w-full accent-[#6b3fa0]"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-[#6b7280]">0 DA</span>
                      <span className="text-sm font-semibold text-white">
                        {sliderValue.toLocaleString("fr-DZ")} DA
                      </span>
                    </div>
                  </div>
                )}

                {/* Reset */}
                {activeFilterCount > 0 && (
                  <>
                    <div className="h-px" style={{ background: "var(--border)" }} />
                    <button
                      onClick={() => { setSort("default"); setMaxPrice(0); }}
                      className="w-full text-xs text-[#6b7280] hover:text-red-400 transition-colors py-1"
                    >
                      Réinitialiser les filtres
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Active sort chip */}
          {sort !== "default" && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(107,63,160,0.12)", border: "1px solid rgba(107,63,160,0.3)", color: "#c084fc" }}>
              {sortLabels[sort]}
              <button onClick={() => setSort("default")} className="hover:text-white transition-colors">×</button>
            </span>
          )}
          {maxPrice > 0 && maxPrice < maxProductPrice && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(107,63,160,0.12)", border: "1px solid rgba(107,63,160,0.3)", color: "#c084fc" }}>
              ≤ {maxPrice.toLocaleString("fr-DZ")} DA
              <button onClick={() => setMaxPrice(0)} className="hover:text-white transition-colors">×</button>
            </span>
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
                  const count = products.filter((p) => p.categorie?.slug?.current === cat.slug.current).length;
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
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
