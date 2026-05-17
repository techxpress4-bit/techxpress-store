"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
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
            className="object-cover transition-transform duration-700 group-hover:scale-110"
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
        <div className="absolute bottom-3 left-0 right-0 flex justify-center sm:translate-y-2 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="btn-primary text-xs py-2 px-4 shadow-lg shadow-violet-900/40">
            Voir le produit →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">

        {/* 1 — Nom */}
        <h3
          className="text-base font-bold text-[#1c1917] sm:text-[#f5f5f5] leading-snug line-clamp-2 sm:group-hover:text-white transition-colors mb-2"
          style={{ fontFamily: "var(--font-syne)", minHeight: "2.5rem" }}
        >
          {product.nom}
        </h3>

        {/* 2 — Prix */}
        <div className="mb-3">
          <p className="price text-xl leading-none">
            {product.prix.toLocaleString("fr-DZ")}
            <span>DA</span>
          </p>
        </div>

        {/* 3 — Catégorie + icône COD */}
        <div className="mt-auto flex items-center justify-between gap-2">
          {product.categorie && (
            <span className="text-[11px] text-[#a8998a] sm:text-[#6b7280] truncate">
              {product.categorie.nom}
            </span>
          )}
          <span
            title="Paiement à la livraison"
            className="flex-shrink-0 text-[#6b7280] hover:text-[#9ca3af] transition-colors cursor-default"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </span>
        </div>

      </div>
    </Link>
  );
}
