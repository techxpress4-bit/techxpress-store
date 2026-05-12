"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Product, AbonnementOption } from "@/lib/types";

interface Props {
  product: Product;
}

export default function AddToCartSection({ product }: Props) {
  const { addItem, openModal } = useCart();
  const [option, setOption] = useState<AbonnementOption>("box-seule");
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "";

  const handleAddToCart = () => {
    if (!product.enStock) return;
    const selectedOption = product.optionAbonnement ? option : undefined;
    addItem(product, selectedOption);
    openModal(product);

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "add_to_cart", {
        currency: "DZD",
        value: product.prix,
        items: [{ item_id: product._id, item_name: product.nom, price: product.prix }],
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Abonnement option */}
      {product.optionAbonnement && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-3" style={{ fontFamily: "var(--font-syne)" }}>
            Choisir une option
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setOption("box-seule")}
              className={`flex-1 p-4 rounded-xl text-left transition-all duration-200 ${
                option === "box-seule"
                  ? "border-2 border-violet"
                  : "border border-[#2a2a2a] hover:border-[#4a4a4a]"
              }`}
              style={{ background: option === "box-seule" ? "rgba(107,63,160,0.12)" : "var(--surface)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option === "box-seule" ? "border-violet" : "border-[#4a4a4a]"}`}>
                  {option === "box-seule" && <span className="w-2 h-2 rounded-full" style={{ background: "var(--violet)" }} />}
                </span>
                <span className="text-sm font-semibold text-white">Box seule</span>
              </div>
              <p className="text-xs text-[#6b7280] ml-6">Sans abonnement TV inclus</p>
            </button>

            <button
              onClick={() => setOption("box-abonnement")}
              className={`flex-1 p-4 rounded-xl text-left transition-all duration-200 relative ${
                option === "box-abonnement"
                  ? "border-2 border-violet"
                  : "border border-[#2a2a2a] hover:border-[#4a4a4a]"
              }`}
              style={{ background: option === "box-abonnement" ? "rgba(107,63,160,0.12)" : "var(--surface)" }}
            >
              <div className="absolute top-2 right-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(107,63,160,0.3)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.3)" }}>
                  Populaire
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option === "box-abonnement" ? "border-violet" : "border-[#4a4a4a]"}`}>
                  {option === "box-abonnement" && <span className="w-2 h-2 rounded-full" style={{ background: "var(--violet)" }} />}
                </span>
                <span className="text-sm font-semibold text-white">Box + Abonnement TV</span>
              </div>
              <p className="text-xs text-[#6b7280] ml-6">Abonnement IPTV inclus</p>
            </button>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={!product.enStock}
        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-200 ${
          product.enStock ? "hover:scale-[1.02] active:scale-[0.99]" : "opacity-40 cursor-not-allowed"
        }`}
        style={product.enStock ? {
          background: "linear-gradient(135deg, var(--violet) 0%, var(--violet-dark) 100%)",
          boxShadow: "0 8px 30px rgba(107,63,160,0.45)",
          color: "white",
          fontSize: "1rem",
          letterSpacing: "0.01em",
        } : {
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        {product.enStock ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Ajouter au panier
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Rupture de stock
          </>
        )}
      </button>

      {/* Commander directement */}
      {product.enStock && (
        <a
          href="/commander"
          className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#1f1f1f]"
          style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Commander maintenant
        </a>
      )}

      {/* WhatsApp link */}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9%20par%20le%20produit%20%3A%20${encodeURIComponent(product.nom)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-[#6b7280] hover:text-[#25D366] transition-colors py-2"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "whatsapp_click", { event_label: product.nom });
            }
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Une question ? Contactez-nous sur WhatsApp
        </a>
      )}
    </div>
  );
}
