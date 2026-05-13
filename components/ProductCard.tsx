"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { isPromoActive } from "@/lib/types";
import { urlFor } from "@/lib/sanity";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl =
    product.photos && product.photos.length > 0
      ? urlFor(product.photos[0]).width(600).height(600).fit("crop").url()
      : null;

  const nouveau = product.nouveaute === true;
  const promoActive = isPromoActive(product);

  return (
    <Link
      href={`/produit/${product.slug.current}`}
      className="group card card-product flex flex-col overflow-hidden cursor-pointer"
      style={{
        background:
          "linear-gradient(135deg, rgba(107,63,160,0.06) 0%, var(--card) 50%)",
      }}
      onClick={() => {
        if (typeof window !== "undefined" && (window as any).gtag) {
          (window as any).gtag("event", "product_click", {
            item_id: product._id,
            item_name: product.nom,
          });
        }
      }}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-[#111] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.nom}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[rgba(107,63,160,0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges — top left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {nouveau && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
              style={{ background: "rgba(0,98,51,0.85)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
              Nouveau
            </span>
          )}
          <span className={`badge-stock ${product.enStock ? "available" : "unavailable"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${product.enStock ? "bg-green-400" : "bg-red-400"}`} />
            {product.enStock ? "En stock" : "Rupture"}
          </span>
        </div>

        {/* Abonnement badge — top right */}
        {product.optionAbonnement && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(107,63,160,0.85)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.3)" }}>
              + Abonnement
            </span>
          </div>
        )}

        {/* Quick view */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="btn-primary text-xs py-2 px-4 shadow-lg shadow-violet-900/40">
            Voir le produit →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-[#f5f5f5] leading-snug line-clamp-2 group-hover:text-white transition-colors"
            style={{ fontFamily: "var(--font-syne)" }}>
            {product.nom}
          </h3>
        </div>

        {product.categorie && (
          <span className="text-xs text-[#6b7280] mb-3">{product.categorie.nom}</span>
        )}

        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="price text-lg leading-none">
              {(promoActive ? product.prixPromo! : product.prix).toLocaleString("fr-DZ")}
              <span>DA</span>
            </p>
            {promoActive && product.prixPromo! < product.prix && (
              <p className="text-xs text-[#6b7280] line-through mt-0.5">
                {product.prix.toLocaleString("fr-DZ")} DA
              </p>
            )}
          </div>
          <span className="text-[10px] text-[#4b5563] pb-0.5">COD</span>
        </div>
      </div>
    </Link>
  );
}
