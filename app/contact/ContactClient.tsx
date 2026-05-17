"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactClient() {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/commande", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Message envoyé ! Nous vous répondrons rapidement.");
      setForm({ nom: "", email: "", telephone: "", message: "" });
    } catch {
      toast.error("Erreur lors de l'envoi. Contactez-nous via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--violet-light)" }}>
            Nous contacter
          </p>
          <h1 className="section-title mb-4">Comment pouvons-nous<br />vous aider ?</h1>
          <p className="text-[#9ca3af] max-w-md mx-auto">
            Remplissez le formulaire ou contactez-nous directement via WhatsApp pour une réponse rapide.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left column — contact channels + infos */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* WhatsApp */}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 flex items-center gap-4 hover:border-[#25D366] group transition-all"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 4px 15px rgba(37,211,102,0.3)" }}>
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm" style={{ fontFamily: "var(--font-syne)" }}>WhatsApp</p>
                  <p className="text-xs text-[#6b7280] mt-0.5">Réponse rapide · Disponible</p>
                </div>
              </a>
            )}

            {/* Réseaux sociaux */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/dztechxpress?igsh=dTJxdnFueGg0Y3E5&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 card p-4 flex items-center gap-3 hover:border-[#E1306C] group transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", boxShadow: "0 4px 15px rgba(225,48,108,0.3)" }}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white text-xs" style={{ fontFamily: "var(--font-syne)" }}>Instagram</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">@dztechxpress</p>
                </div>
              </a>

              <a
                href="https://www.tiktok.com/@techxpress23?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 card p-4 flex items-center gap-3 hover:border-white group transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-black"
                  style={{ boxShadow: "0 4px 15px rgba(255,255,255,0.1)" }}>
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white text-xs" style={{ fontFamily: "var(--font-syne)" }}>TikTok</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5">@techxpress23</p>
                </div>
              </a>
            </div>

            {/* Infos utiles */}
            <div className="card p-5">
              <h3 className="font-bold text-white text-sm mb-5" style={{ fontFamily: "var(--font-syne)" }}>
                Infos utiles
              </h3>
              <div className="space-y-4">
                {[
                  { icon: "🚚", label: "Livraison", value: "58 wilayas d'Algérie" },
                  { icon: "💵", label: "Paiement", value: "À la livraison (COD)" },
                  { icon: "⏰", label: "Réponse", value: "Sous 24h" },
                  { icon: "🛡️", label: "Garantie", value: "Produits vérifiés" },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{info.icon}</span>
                    <div>
                      <p className="text-[11px] text-[#6b7280] leading-none mb-0.5">{info.label}</p>
                      <p className="text-xs text-[#f5f5f5] font-medium">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right column — form */}
          <div className="lg:col-span-3">
            <div className="card p-6 lg:p-8">
              <h2 className="font-bold text-white mb-6" style={{ fontFamily: "var(--font-syne)" }}>
                Envoyez-nous un message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Nom complet *</label>
                    <input type="text" name="nom" value={form.nom} onChange={handleChange} required placeholder="Votre nom" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Téléphone *</label>
                    <input type="tel" name="telephone" value={form.telephone} onChange={handleChange} required placeholder="05 XX XX XX XX" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Email (optionnel)</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="votre@email.com" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Message *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder="Votre question ou demande..." className="input-field resize-none" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? "Envoi en cours…" : "Envoyer le message"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
