"use client";

import { useMemo, useRef, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { client as sanityClient } from "@/lib/sanity";
import { allProductsQuery, allCategoriesQuery } from "@/lib/queries";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "nouveau";

const sortLabels: Record<SortOption, string> = {
  default: "Par défaut",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  "name-asc": "A → Z",
  nouveau: "Nouveautés",
};

function isSort(v: string | null): v is SortOption {
  return v === "default" || v === "price-asc" || v === "price-desc" || v === "name-asc" || v === "nouveau";
}

interface Props {
  products: Product[];
  categories: Category[];
  currentCategorySlug?: string;
}

export default function CatalogueClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <CatalogueInner {...props} />
    </Suspense>
  );
}

function CatalogueInner({ products: initialProducts, categories: initialCategories, currentCategorySlug }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  useEffect(() => {
    const c = sanityClient.withConfig({ useCdn: false });
    c.fetch<Product[]>(allProductsQuery)
      .then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) setProducts(fresh);
      })
      .catch(() => {});
    c.fetch<Category[]>(allCategoriesQuery)
      .then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) setCategories(fresh);
      })
      .catch(() => {});
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sortRaw = searchParams.get("sort");
  const sort: SortOption = isSort(sortRaw) ? sortRaw : "default";
  const searchQ = searchParams.get("q") || "";
  const maxPriceRaw = Number(searchParams.get("max")) || 0;

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === "0" || value === "default") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Filtre par catégorie active (si la page courante en a une)
  const scopedProducts = useMemo(() => {
    if (!currentCategorySlug) return products;
    return products.filter((p) => p.categorie?.slug?.current === currentCategorySlug);
  }, [products, currentCategorySlug]);

  const maxProductPrice = useMemo(
    () => Math.max(...scopedProducts.map((p) => p.prix), 0),
    [scopedProducts]
  );
  const maxPrice = maxPriceRaw > 0 && maxPriceRaw < maxProductPrice ? maxPriceRaw : 0;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    let filtered = [...scopedProducts];
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      filtered = filtered.filter((p) =>
        p.nom.toLowerCase().includes(q) ||
        p.categorie?.nom?.toLowerCase().includes(q)
      );
    }
    if (maxPrice > 0) {
      filtered = filtered.filter((p) => p.prix <= maxPrice);
    }
    switch (sort) {
      case "price-asc": return filtered.sort((a, b) => a.prix - b.prix);
      case "price-desc": return filtered.sort((a, b) => b.prix - a.prix);
      case "name-asc": return filtered.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
      case "nouveau": return filtered.sort((a, b) => (b.nouveaute ? 1 : 0) - (a.nouveaute ? 1 : 0));
      default: return filtered;
    }
  }, [scopedProducts, sort, searchQ, maxPrice]);

  const activeFilterCount = [sort !== "default", maxPrice > 0].filter(Boolean).length;
  const sliderValue = maxPrice > 0 ? maxPrice : maxProductPrice;

  // Préserve les filtres quand on clique sur une catégorie dans la sidebar
  function linkWithFilters(href: string) {
    const qs = searchParams.toString();
    return qs ? `${href}?${qs}` : href;
  }

  const activeCat = currentCategorySlug
    ? categories.find((c) => c.slug.current === currentCategorySlug)
    : null;

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          {activeCat ? (
            <>
              <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-4">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <span>/</span>
                <Link href={linkWithFilters("/catalogue")} className="hover:text-white transition-colors">Catalogue</Link>
                <span>/</span>
                <span className="text-white">{activeCat.nom}</span>
              </nav>
              {activeCat.icone && <span className="text-4xl mb-3 block">{activeCat.icone}</span>}
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--violet-light)" }}>
                Catégorie
              </p>
              <h1 className="section-title mb-2">{activeCat.nom}</h1>
              {activeCat.description && (
                <p className="text-[#9ca3af] max-w-xl">{activeCat.description}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--violet-light)" }}>
                Catalogue complet
              </p>
              <h1 className="section-title mb-2">Tous nos produits</h1>
            </>
          )}
          <p className="text-[#6b7280] text-sm mt-2">
            {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 mb-8">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
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
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-3">Trier par</p>
                  <div className="flex flex-col gap-1.5">
                    {(Object.entries(sortLabels) as [SortOption, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => updateParam("sort", value)}
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
                        updateParam("max", v >= maxProductPrice ? null : String(v));
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

                {activeFilterCount > 0 && (
                  <>
                    <div className="h-px" style={{ background: "var(--border)" }} />
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("sort");
                        params.delete("max");
                        const qs = params.toString();
                        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
                      }}
                      className="w-full text-xs text-[#6b7280] hover:text-red-400 transition-colors py-1"
                    >
                      Réinitialiser les filtres
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {sort !== "default" && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(107,63,160,0.12)", border: "1px solid rgba(107,63,160,0.3)", color: "#c084fc" }}>
              {sortLabels[sort]}
              <button onClick={() => updateParam("sort", null)} className="hover:text-white transition-colors">×</button>
            </span>
          )}
          {maxPrice > 0 && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: "rgba(107,63,160,0.12)", border: "1px solid rgba(107,63,160,0.3)", color: "#c084fc" }}>
              ≤ {maxPrice.toLocaleString("fr-DZ")} DA
              <button onClick={() => updateParam("max", null)} className="hover:text-white transition-colors">×</button>
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
                  href={linkWithFilters("/catalogue")}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors"
                  style={
                    !currentCategorySlug
                      ? { background: "rgba(107,63,160,0.2)", border: "1px solid rgba(107,63,160,0.3)", color: "#fff" }
                      : { color: "#9ca3af" }
                  }
                >
                  Tous les produits
                  <span className="text-xs text-[#9ca3af]">{products.length}</span>
                </Link>
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categorie?.slug?.current === cat.slug.current).length;
                  const isActive = cat.slug.current === currentCategorySlug;
                  return (
                    <Link
                      key={cat._id}
                      href={linkWithFilters(`/catalogue/${cat.slug.current}`)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "text-white font-medium"
                          : "text-[#9ca3af] hover:text-white hover:bg-[#1f1f1f]"
                      }`}
                      style={
                        isActive
                          ? { background: "rgba(107,63,160,0.2)", border: "1px solid rgba(107,63,160,0.3)" }
                          : {}
                      }
                    >
                      {cat.nom}
                      <span className={`text-xs ${isActive ? "text-[#9ca3af]" : "text-[#4b5563]"}`}>{count}</span>
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
                  {searchQ ? `Aucun résultat pour "${searchQ}"` : "Aucun produit ne correspond aux filtres actifs."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("sort");
                      params.delete("max");
                      const qs = params.toString();
                      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
                    }}
                    className="btn-secondary mt-4 text-sm"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

