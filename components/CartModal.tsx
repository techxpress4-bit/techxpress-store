"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { urlFor } from "@/lib/sanity";
import { getItemPrice } from "@/lib/types";

export default function CartModal() {
  const { closeModal, lastAdded, totalItems } = useCart();
  const prevOverflow = useRef("");

  useEffect(() => {
    prevOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow.current; };
  }, []);

  const price = lastAdded ? getItemPrice(lastAdded) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md mx-4 animate-slide-up">
        <div className="card p-6 shadow-2xl shadow-black/80" style={{ background: "var(--card)", border: "1px solid rgba(107,63,160,0.4)" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(107,63,160,0.2)", border: "1px solid rgba(107,63,160,0.4)" }}>
                <svg className="w-4 h-4" style={{ color: "var(--violet-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
                Ajouté au panier !
              </h3>
            </div>
            <button
              onClick={closeModal}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product preview */}
          {lastAdded && (
            <div className="flex gap-4 p-3 rounded-xl mb-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#111]">
                {lastAdded.product.photos && lastAdded.product.photos.length > 0 ? (
                  <Image
                    src={urlFor(lastAdded.product.photos[0]).width(128).height(128).url()}
                    alt={lastAdded.product.nom}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white line-clamp-2" style={{ fontFamily: "var(--font-syne)" }}>
                  {lastAdded.product.nom}
                </p>
                {lastAdded.optionAbonnement && (
                  <p className="text-xs text-[#9ca3af] mt-0.5">
                    {lastAdded.optionAbonnement === "box-abonnement" ? "Box + Abonnement TV" : "Box seule"}
                  </p>
                )}
                <p className="price text-sm mt-1">
                  {price.toLocaleString("fr-DZ")}<span>DA</span>
                </p>
              </div>
            </div>
          )}

          {/* Cart count */}
          <p className="text-xs text-[#6b7280] mb-5 text-center">
            {totalItems} article{totalItems > 1 ? "s" : ""} dans votre panier
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/panier"
              className="btn-primary justify-center w-full"
              onClick={closeModal}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Voir le panier
            </Link>
            <button onClick={closeModal} className="btn-secondary justify-center w-full">
              Continuer les achats
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
