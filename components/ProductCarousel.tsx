"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

export default function ProductCarousel({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  function scroll(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full flex-shrink-0"
            style={{ background: "linear-gradient(180deg, var(--violet), var(--violet-light))" }} />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Best Sellers
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            aria-label="Précédent"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background: canLeft ? "var(--surface)" : "transparent",
              border: `1px solid ${canLeft ? "var(--border)" : "#1a1a1a"}`,
              color: canLeft ? "#9ca3af" : "#3d3d3d",
              cursor: canLeft ? "pointer" : "default",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canRight}
            aria-label="Suivant"
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{
              background: canRight ? "var(--surface)" : "transparent",
              border: `1px solid ${canRight ? "var(--border)" : "#1a1a1a"}`,
              color: canRight ? "#9ca3af" : "#3d3d3d",
              cursor: canRight ? "pointer" : "default",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <Link href="/catalogue"
            className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-lg transition-all hover:text-white ml-1"
            style={{ color: "var(--violet-light)", border: "1px solid rgba(107,63,160,0.25)", background: "rgba(107,63,160,0.06)" }}>
            Voir tout →
          </Link>
        </div>
      </div>

      {/* 2-row scrollable grid */}
      <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
        <div
          className="grid gap-4"
          style={{
            gridTemplateRows: "repeat(2, auto)",
            gridAutoFlow: "column",
            gridAutoColumns: "clamp(200px, calc(25% - 12px), 320px)",
          }}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
