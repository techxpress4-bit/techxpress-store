"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

export default function ProductCarousel({ products }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 rounded-full flex-shrink-0"
            style={{ background: "linear-gradient(180deg, var(--violet), var(--violet-light))" }}
          />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Best Sellers
          </h2>
        </div>
        <Link
          href="/catalogue"
          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:text-white"
          style={{ color: "var(--violet-light)", border: "1px solid rgba(107,63,160,0.25)", background: "rgba(107,63,160,0.06)" }}
        >
          Voir tout →
        </Link>
      </div>

      {/* Grid — 2 colonnes mobile, 4 colonnes sm+ → 2 rangées pour 8 produits */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
