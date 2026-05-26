"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { wilayas } from "@/lib/wilayas";
import {
  getShippingFee,
  stopDeskAvailable,
  hasShipping,
  SHIPPING_OPTION_LABELS,
  type ShippingOption,
} from "@/lib/shipping";
import type { AbonnementOption } from "@/lib/types";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

const abonnementLabels: Record<AbonnementOption, string> = {
  "box-seule": "Box seule",
  "box-abonnement": "Box + Abonnement TV",
};

export default function CommanderClient() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    adresse: "",
    codePostal: "",
    daira: "",
    telephone: "",
    wilaya: "",
    email: "",
    message: "",
  });
  const [shippingOption, setShippingOption] = useState<ShippingOption>("domicile");

  // If user switches to a wilaya without Stop Desk, force back to domicile.
  useEffect(() => {
    if (form.wilaya && shippingOption === "stop_desk" && !stopDeskAvailable(form.wilaya)) {
      setShippingOption("domicile");
    }
  }, [form.wilaya, shippingOption]);

  const shippingFee = form.wilaya ? getShippingFee(form.wilaya, shippingOption) : null;
  const wilayaHasShipping = form.wilaya ? hasShipping(form.wilaya) : true;
  const totalWithShipping = totalPrice + (shippingFee ?? 0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (data.user?.email) {
          setLoggedInEmail(data.user.email);
          setUserId(data.user.id);
        }
        setAuthReady(true);
      })
      .catch(() => setAuthReady(true));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    const email = loggedInEmail ?? form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Adresse e-mail invalide");
      return;
    }

    const phoneClean = form.telephone.replace(/[\s\-.()]/g, "");
    if (!/^(?:0[567]\d{8}|\+[1-9]\d{7,14})$/.test(phoneClean)) {
      toast.error("Numéro invalide (ex : 05XXXXXXXX ou +33XXXXXXXXX)");
      return;
    }

    if (!wilayaHasShipping || shippingFee === null) {
      toast.error(
        "Cette wilaya n'a pas de tarif de livraison configuré. Contactez-nous sur WhatsApp."
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          telephone: phoneClean,
          email,
          userId: userId ?? undefined,
          items,
          totalPrice,
          shippingOption,
          shippingFee,
        }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      if (typeof window !== "undefined" && (window as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as { gtag?: (...args: unknown[]) => void }).gtag!("event", "purchase", {
          currency: "DZD",
          value: totalWithShipping,
          shipping: shippingFee ?? 0,
          transaction_id: `TX-${Date.now()}`,
        });
      }

      clearCart();
      router.push("/confirmation");
    } catch {
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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
                    value={form.nom}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Adresse *</label>
                <input
                  type="text"
                  name="adresse"
                  autoComplete="street-address"
                  value={form.adresse}
                  onChange={handleChange}
                  required
                  placeholder="Numéro, rue, quartier..."
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Code postal (facultatif)</label>
                  <input
                    type="text"
                    name="codePostal"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    value={form.codePostal}
                    onChange={handleChange}
                    placeholder="ex : 16000"
                    className="input-field"
                    maxLength={10}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Daïra *</label>
                  <input
                    type="text"
                    name="daira"
                    autoComplete="address-level2"
                    value={form.daira}
                    onChange={handleChange}
                    required
                    placeholder="Daïra de livraison"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5 flex items-center gap-2">
                  Email *
                  {loggedInEmail && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: "rgba(107,63,160,0.2)", color: "var(--violet-light)" }}>
                      Compte connecté
                    </span>
                  )}
                </label>
                {loggedInEmail ? (
                  <div
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{ background: "rgba(107,63,160,0.08)", border: "1px solid rgba(107,63,160,0.25)" }}
                  >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--violet-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[#f5f5f5]">{loggedInEmail}</span>
                  </div>
                ) : (
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                    className="input-field"
                    disabled={!authReady}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                    placeholder="05 XX XX XX XX ou +33 ..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Wilaya *</label>
                  <select
                    name="wilaya"
                    autoComplete="address-level1"
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

              {/* Mode de livraison */}
              {form.wilaya && (
                <div className="mt-5">
                  <label className="block text-xs font-medium text-[#9ca3af] mb-2">Mode de livraison *</label>
                  {!wilayaHasShipping ? (
                    <div
                      className="p-3 rounded-xl text-sm"
                      style={{
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.3)",
                        color: "#fca5a5",
                      }}
                    >
                      Aucun tarif de livraison configuré pour cette wilaya. Contactez-nous sur WhatsApp pour un devis.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(["domicile", "stop_desk"] as ShippingOption[]).map((opt) => {
                        const fee = getShippingFee(form.wilaya, opt);
                        const available = fee !== null;
                        const isSelected = shippingOption === opt;
                        return (
                          <button
                            type="button"
                            key={opt}
                            disabled={!available}
                            onClick={() => available && setShippingOption(opt)}
                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={
                              isSelected
                                ? {
                                    background: "rgba(107,63,160,0.15)",
                                    border: "1px solid rgba(107,63,160,0.5)",
                                    color: "#fff",
                                  }
                                : {
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    color: "#9ca3af",
                                  }
                            }
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`relative w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center`}
                                style={{
                                  border: `2px solid ${isSelected ? "#c084fc" : "#3a3a3a"}`,
                                  background: isSelected ? "#c084fc" : "transparent",
                                }}
                              >
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </span>
                              <div>
                                <p className="text-xs font-semibold leading-tight">
                                  {SHIPPING_OPTION_LABELS[opt]}
                                </p>
                                {!available && (
                                  <p className="text-[10px] text-[#6b7280] mt-0.5">Indisponible</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-bold flex-shrink-0" style={{ color: available ? (isSelected ? "var(--violet-light)" : "#f5f5f5") : "#6b7280" }}>
                              {available ? `${fee.toLocaleString("fr-DZ")} DA` : "—"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

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
                Un récapitulatif sera envoyé à votre adresse email. Notre équipe vous contactera sous <strong className="text-white">24h</strong> pour confirmer la livraison. <strong className="text-white">Paiement à la livraison uniquement.</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !authReady}
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
                {items.map((item) => {
                  const today = new Date().toISOString().split("T")[0];
                  const promoActive = !!item.product.prixPromo && item.product.prixPromo < item.product.prix &&
                    (!item.product.dateDebutPromo || item.product.dateDebutPromo <= today) &&
                    (!item.product.dateFinPromo || item.product.dateFinPromo >= today);
                  const unitPrice = item.variantPrix !== undefined
                    ? item.variantPrix
                    : item.optionAbonnement === "box-abonnement" && item.product.prixAvecAbonnement
                      ? item.product.prixAvecAbonnement
                      : promoActive ? item.product.prixPromo! : item.product.prix;
                  return (
                    <div key={`${item.product._id}-${item.variantKey ?? "none"}-${item.optionAbonnement}`} className="flex justify-between gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f5f5f5] line-clamp-2 text-xs font-medium" style={{ fontFamily: "var(--font-syne)" }}>
                          {item.product.nom}
                        </p>
                        {item.variantNom && (
                          <p className="text-xs mt-0.5 font-semibold" style={{ color: "var(--violet-light)" }}>
                            {item.variantNom}
                          </p>
                        )}
                        {item.optionAbonnement && (
                          <p className="text-[#6b7280] text-xs mt-0.5">
                            {abonnementLabels[item.optionAbonnement]}
                          </p>
                        )}
                        <p className="text-[#6b7280] text-xs">Qté : {item.quantity}</p>
                      </div>
                      <span className="text-white text-sm flex-shrink-0 font-semibold">
                        {(unitPrice * item.quantity).toLocaleString("fr-DZ")} DA
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="divider mb-4" />

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#9ca3af]">Sous-total</span>
                <span className="text-sm text-[#f5f5f5] font-semibold">
                  {totalPrice.toLocaleString("fr-DZ")} DA
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#9ca3af]">
                  Livraison
                  {form.wilaya && wilayaHasShipping && shippingFee !== null && (
                    <span className="block text-[10px] text-[#6b7280] mt-0.5">
                      {SHIPPING_OPTION_LABELS[shippingOption]}
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold" style={{ color: form.wilaya && shippingFee !== null ? "#f5f5f5" : "#6b7280" }}>
                  {form.wilaya && shippingFee !== null
                    ? `${shippingFee.toLocaleString("fr-DZ")} DA`
                    : "Choisir une wilaya"}
                </span>
              </div>

              <div className="divider mb-4" />

              <div className="flex justify-between items-center mb-5">
                <span className="font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>Total</span>
                <span className="price text-lg">
                  {totalWithShipping.toLocaleString("fr-DZ")}<span>DA</span>
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
