"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { wilayas } from "@/lib/wilayas";
import type { AbonnementOption } from "@/lib/types";
import toast from "react-hot-toast";

const abonnementLabels: Record<AbonnementOption, string> = {
  "box-seule": "Box seule",
  "box-abonnement": "Box + Abonnement TV",
};

export default function CommanderClient() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    adresse: "",
    telephone: "",
    wilaya: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, totalPrice }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "purchase", {
          currency: "DZD",
          value: totalPrice,
          transaction_id: `TX-${Date.now()}`,
        });
      }

      clearCart();
      router.push("/confirmation");
    } catch (err) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
            Votre panier est vide
          </h1>
          <a href="/catalogue" className="btn-primary mt-4">
            Explorer le catalogue
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--violet-light)" }}>
            Finaliser
          </p>
          <h1 className="section-title">Votre commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-syne)" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--violet)" }}>1</span>
                Vos informations
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    required
                    placeholder="Votre prénom"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Nom *</label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Adresse complète *</label>
                <input
                  type="text"
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  required
                  placeholder="Numéro, rue, quartier, commune..."
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    placeholder="05 XX XX XX XX"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Wilaya *</label>
                  <select
                    name="wilaya"
                    value={form.wilaya}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Sélectionner une wilaya</option>
                    {wilayas.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Message (optionnel)
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Instructions de livraison, questions..."
                  className="input-field resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl text-sm text-[#9ca3af] flex items-start gap-3" style={{ background: "rgba(107,63,160,0.08)", border: "1px solid rgba(107,63,160,0.2)" }}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--violet-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                Après validation, notre équipe vous contactera sous <strong className="text-white">24h</strong> pour confirmer votre commande et organiser la livraison. <strong className="text-white">Paiement à la livraison uniquement.</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-4"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Valider ma commande
                </>
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-syne)" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--violet)" }}>2</span>
                Récapitulatif
              </h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.optionAbonnement}`} className="flex justify-between gap-3 text-sm">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f5f5f5] line-clamp-2 text-xs font-medium" style={{ fontFamily: "var(--font-syne)" }}>
                        {item.product.nom}
                      </p>
                      {item.optionAbonnement && (
                        <p className="text-[#6b7280] text-xs mt-0.5">
                          {abonnementLabels[item.optionAbonnement]}
                        </p>
                      )}
                      <p className="text-[#6b7280] text-xs">Qté : {item.quantity}</p>
                    </div>
                    <span className="text-white text-sm flex-shrink-0 font-semibold">
                      {(item.product.prix * item.quantity).toLocaleString("fr-DZ")} DA
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider mb-4" />

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#9ca3af]">Livraison</span>
                <span className="text-sm text-green-400 font-medium">À confirmer</span>
              </div>

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>Total produits</span>
                <span className="price text-lg">
                  {totalPrice.toLocaleString("fr-DZ")}<span>DA</span>
                </span>
              </div>

              <div className="p-3 rounded-xl text-xs text-[#6b7280] flex items-center gap-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span>💵</span>
                Paiement à la livraison — vous payez à la réception
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
