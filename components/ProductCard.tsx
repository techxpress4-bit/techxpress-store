"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

interface ProductCardProps {
  product: Product;
}

function isPromoActive(product: Product): boolean {
  if (!product.prixPromo || product.prixPromo >= product.prix) return false;
  const today = new Date().toISOString().split("T")[0];
  if (product.dateDebutPromo && product.dateDebutPromo > today) return false;
  if (product.dateFinPromo && product.dateFinPromo < today) return false;
  return true;
}

/* Styles partagés pour tous les badges */
const badgeBase = "inline-flex items-center gap-0.5 font-bold uppercase tracking-wider rounded-full border text-[9px] px-2 py-0.5 sm:text-[10px] sm:px-2.5 sm:py-1";

export default function ProductCard({ product }: ProductCardProps) {
  const coverSource = product.photos?.[0] ?? product.varianteCover ?? null;
  const imageUrl = coverSource ? urlFor(coverSource).width(600).height(600).url() : null;

  const promo = isPromoActive(product);
  const prixAffiche = promo ? product.prixPromo! : product.prix;

  return (
    <Link
      href={`/produit/${product.slug.current}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      style={{ background: "#efefef" }}
      onClick={() => {
        const w = typeof window !== "undefined" ? (window as { gtag?: (...args: unknown[]) => void }) : null;
        if (w?.gtag) {
          w.gtag("event", "product_click", { item_id: product._id, item_name: product.nom });
        }
      }}
    >
      {/* ── Zone image (fond blanc) ── */}
      <div className="relative aspect-square bg-white overflow-hidden">

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start pointer-events-none z-10">
          {/* Gauche : statut + promo + nouveau */}
          <div className="flex flex-col gap-1 sm:gap-1.5">
            {product.enStock ? (
              <span className={`${badgeBase} bg-green-100 text-green-700 border-green-200`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                En stock
              </span>
            ) : (
              <span className={`${badgeBase} bg-red-100 text-red-700 border-red-200`}>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                Rupture
              </span>
            )}
            {promo && (
              <span className={`${badgeBase} bg-rose-100 text-rose-600 border-rose-200`}>
                Promo
              </span>
            )}
            {product.nouveaute && !promo && (
              <span className={`${badgeBase} bg-amber-100 text-amber-700 border-amber-200`}>
                Nouveau
              </span>
            )}
          </div>

          {/* Droite : abonnement */}
          {product.optionAbonnement && (
            <div className="flex flex-col gap-1 sm:gap-1.5 items-end">
              <span className={`${badgeBase} bg-violet-100 text-violet-700 border-violet-200`}>
                {/* Texte court sur mobile, complet sur desktop */}
                <span className="sm:hidden">+ Abo</span>
                <span className="hidden sm:inline">+ Abonnement</span>
              </span>
            </div>
          )}
        </div>

        {/* Image — inset légèrement réduit sur mobile pour zoomer */}
        {imageUrl ? (
          <div className="absolute inset-[5%] sm:inset-[8%]">
            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={product.nom}
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Fondu blanc → #efefef en bas de l'image */}
        <div
          className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-[5]"
          style={{ background: "linear-gradient(to bottom, transparent, #efefef)" }}
        />

        {/* Hover overlay + CTA */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 z-[6]">
          <span className="bg-white text-neutral-900 px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg">
            Voir le produit →
          </span>
        </div>
      </div>

      {/* ── Zone info (fond légèrement plus foncé) ── */}
      <div className="p-3 sm:p-4" style={{ background: "#efefef" }}>
        <h3
          className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          {product.nom}
        </h3>
        {product.categorie && (
          <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5 sm:mt-1 line-clamp-1">
            {product.categorie.nom}
          </p>
        )}
        {product.variantes && product.variantes.length > 0 && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {product.variantes.slice(0, 6).map((v) =>
              v.couleur ? (
                <span
                  key={v._key}
                  title={v.nom}
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: v.couleur, boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }}
                />
              ) : (
                <span
                  key={v._key}
                  title={v.nom}
                  className="text-[9px] font-medium text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-300 bg-white flex-shrink-0 leading-none"
                >
                  {v.nom.length > 8 ? `${v.nom.slice(0, 7)}…` : v.nom}
                </span>
              )
            )}
            {product.variantes.length > 6 && (
              <span className="text-[9px] text-neutral-400">+{product.variantes.length - 6}</span>
            )}
          </div>
        )}
        <div className="mt-2 sm:mt-3">
          {promo && (
            <p className="text-[10px] sm:text-xs text-neutral-400 line-through leading-none mb-0.5">
              {product.prix.toLocaleString("fr-DZ")} DA
            </p>
          )}
          <p
            className={`text-base sm:text-lg font-bold leading-none ${promo ? "text-rose-600" : "text-neutral-900"}`}
            style={{ fontFamily: "var(--font-syne)" }}
          >
            {prixAffiche.toLocaleString("fr-DZ")}
            <span className="text-xs sm:text-sm font-medium text-neutral-500 ml-1">DA</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
