"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

const categoryMeta: Record<string, { icon: string; gradient: string; accent: string }> = {
  "box-tv-android":        { icon: "📺", gradient: "135deg, #1a0533 0%, #4a1f7a 100%", accent: "#9b59fc" },
  "abonnements-tv":        { icon: "📡", gradient: "135deg, #001230 0%, #1a4ed8 100%", accent: "#60a5fa" },
  "accessoires-telephone": { icon: "📱", gradient: "135deg, #1a001a 0%, #7c3aed 100%", accent: "#c084fc" },
  "routeur-modem":         { icon: "📶", gradient: "135deg, #001a10 0%, #047857 100%", accent: "#34d399" },
  cables:                  { icon: "🔌", gradient: "135deg, #1a0c00 0%, #b45309 100%", accent: "#fbbf24" },
  "support-tv":            { icon: "🖥️", gradient: "135deg, #0a0a1a 0%, #1d4ed8 100%", accent: "#93c5fd" },
  paraboles:               { icon: "🛰️", gradient: "135deg, #001a18 0%, #0f766e 100%", accent: "#2dd4bf" },
};

interface Props {
  categories: Category[];
}

export default function CategoryCarousel({ categories }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function checkScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

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
  }, []);

  function scroll(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 rounded-full flex-shrink-0"
            style={{ background: "linear-gradient(180deg, var(--violet), var(--violet-light))" }} />
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Catégories populaires
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
              border: `1px solid ${canLeft ? "rgba(107,63,160,0.4)" : "#1a1a1a"}`,
              color: canLeft ? "#c084fc" : "#3d3d3d",
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
              border: `1px solid ${canRight ? "rgba(107,63,160,0.4)" : "#1a1a1a"}`,
              color: canRight ? "#c084fc" : "#3d3d3d",
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
            Tout voir →
          </Link>
        </div>
      </div>

      {/* Scroll row */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const meta = categoryMeta[cat.slug.current] ?? {
            icon: "📦",
            gradient: "135deg, #111 0%, #222 100%",
            accent: "#6b3fa0",
          };
          return (
            <Link
              key={cat._id}
              href={`/catalogue/${cat.slug.current}`}
              className="group flex-shrink-0 cursor-pointer flex flex-col overflow-hidden rounded-2xl"
              style={{
                width: "clamp(140px, 18vw, 200px)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Image ou gradient */}
              <div className="relative overflow-hidden" style={{ height: "8rem" }}>
                {cat.image?.asset?.url ? (
                  <Image
                    src={cat.image.asset.url}
                    alt={cat.image.alt || cat.nom}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 160px, 200px"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0" style={{ background: `linear-gradient(${meta.gradient})` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl transition-transform duration-300 group-hover:scale-110 drop-shadow-lg">
                        {cat.icone || meta.icon}
                      </span>
                    </div>
                  </>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>

              {/* Nom sous l'image sur fond noir */}
              <div
                className="px-3 py-2 flex items-center justify-center"
                style={{ background: "var(--surface)", borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p
                  className="text-xs font-bold text-white text-center leading-tight line-clamp-1"
                  style={{ fontFamily: "var(--font-syne)" }}
                >
                  {cat.nom}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
