"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { urlFor } from "@/lib/sanity";
import type { AbonnementOption } from "@/lib/types";
import { getItemPrice } from "@/lib/types";

const abonnementLabels: Record<AbonnementOption, string> = {
  "box-seule": "Box seule",
  "box-abonnement": "Box + Abonnement TV",
};

export default function CartPageClient() {
  const { items, removeItem, updateQuantity, updateOption, clearCart, totalPrice } = useCart();
  const [confirmClear, setConfirmClear] = useState(false);

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <svg className="w-12 h-12 text-[#4b5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
            Votre panier est vide
          </h1>
          <p className="text-[#6b7280] mb-6">Ajoutez des produits pour commencer</p>
          <Link href="/catalogue" className="btn-primary">
            Explorer le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--violet-light)" }}>
              Récapitulatif
            </p>
            <h1 className="section-title">Votre panier</h1>
          </div>
          {confirmClear ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#9ca3af]">Vider le panier ?</span>
              <button
                onClick={() => { clearCart(); setConfirmClear(false); }}
                className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors font-semibold"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 rounded-lg bg-[#1f1f1f] text-[#6b7280] hover:text-[#9ca3af] transition-colors"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-[#6b7280] hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Vider le panier
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items list */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const imageUrl =
                item.product.photos?.[0]
                  ? urlFor(item.product.photos[0]).width(200).height(200).url()
                  : null;

              return (
                <div key={`${item.product._id}-${item.optionAbonnement}`} className="card p-5 flex gap-5">
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-[#111]">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={item.product.nom} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/produit/${item.product.slug.current}`} className="text-sm font-semibold text-white hover:text-[#c084fc] transition-colors line-clamp-2 block" style={{ fontFamily: "var(--font-syne)" }}>
                      {item.product.nom}
                    </Link>

                    {/* Abonnement option */}
                    {item.product.optionAbonnement && (
                      <div className="flex gap-2 mt-2">
                        {(["box-seule", "box-abonnement"] as AbonnementOption[]).map((opt) => (
                          <button
                            key={opt}
                            onClick={() => updateOption(item.product._id, item.optionAbonnement, opt)}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                              item.optionAbonnement === opt
                                ? "text-white"
                                : "text-[#6b7280] border border-[#2a2a2a] hover:border-[#4a4a4a]"
                            }`}
                            style={item.optionAbonnement === opt ? { background: "var(--violet)", border: "1px solid transparent" } : {}}
                          >
                            {abonnementLabels[opt]}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 gap-4 flex-wrap">
                      {/* Quantity */}
                      <div className="flex items-center gap-1 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.optionAbonnement)}
                          className="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-[#2a2a2a] transition-colors text-lg"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.optionAbonnement)}
                          className="w-8 h-8 flex items-center justify-center text-[#9ca3af] hover:text-white hover:bg-[#2a2a2a] transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>

                      <p className="price text-base">
                        {(getItemPrice(item) * item.quantity).toLocaleString("fr-DZ")}
                        <span>DA</span>
                      </p>

                      <button
                        onClick={() => removeItem(item.product._id, item.optionAbonnement)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6b7280] hover:text-red-400 hover:bg-[#2a2a2a] transition-colors"
                        aria-label="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-white mb-5" style={{ fontFamily: "var(--font-syne)" }}>
                Récapitulatif
              </h3>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.optionAbonnement}`} className="flex justify-between text-sm">
                    <span className="text-[#9ca3af] line-clamp-1 flex-1 mr-2">
                      {item.product.nom} ×{item.quantity}
                      {item.optionAbonnement && (
                        <span className="block text-xs text-[#6b7280]">
                          {abonnementLabels[item.optionAbonnement]}
                        </span>
                      )}
                    </span>
                    <span className="text-white flex-shrink-0">
                      {(getItemPrice(item) * item.quantity).toLocaleString("fr-DZ")} DA
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider mb-5" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>Total</span>
                <span className="price text-xl">
                  {totalPrice.toLocaleString("fr-DZ")}<span>DA</span>
                </span>
              </div>

              <div className="p-3 rounded-xl text-xs text-[#6b7280] mb-5 flex items-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span>💵</span>
                Paiement à la livraison — aucun paiement en ligne requis
              </div>

              <Link
                href="/commander"
                className="btn-primary justify-center w-full text-base"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).gtag) {
                    (window as any).gtag("event", "begin_checkout", {
                      currency: "DZD",
                      value: totalPrice,
                    });
                  }
                }}
              >
                Valider la commande →
              </Link>

              <Link href="/catalogue" className="btn-ghost justify-center w-full mt-3 text-sm">
                ← Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
