"use client";

import { useState, useEffect, useRef } from "react";

interface Avis {
  id: string;
  created_at: string;
  auteur: string;
  note: number;
  texte?: string;
  photos?: string[];
}

interface Props {
  productSlug: string;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#4b5563"} strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function Stars({ note, size = "sm" }: { note: number; size?: "sm" | "lg" }) {
  return (
    <div className={`flex items-center gap-0.5 ${size === "lg" ? "[&_svg]:w-5 [&_svg]:h-5" : ""}`}>
      {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} filled={i <= note} />)}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill={(hover || value) >= i ? "#f59e0b" : "none"} stroke={(hover || value) >= i ? "#f59e0b" : "#374151"} strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="text-sm text-[#f59e0b] font-semibold ml-1">
          {["", "Mauvais", "Moyen", "Bien", "Très bien", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
}

export default function ReviewSection({ productSlug }: Props) {
  const [reviews, setReviews] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ auteur: "", texte: "", note: 0 });
  const [photos, setPhotos] = useState<{ preview: string; base64: string; type: string }[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/avis?slug=${encodeURIComponent(productSlug)}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productSlug]);

  const avgNote = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.note, 0) / reviews.length
    : 0;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo trop volumineuse (max 2 Mo)");
        continue;
      }
      const base64 = await toBase64(file);
      const preview = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, { preview, base64, type: file.type }].slice(0, 3));
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.auteur.trim() || form.note < 1) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: productSlug,
          auteur: form.auteur.trim(),
          texte: form.texte.trim(),
          note: form.note,
          photos: photos.map((p) => ({ data: p.base64, type: p.type })),
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setShowForm(false);
      // Optimistic update
      setReviews((prev) => [{
        id: `opt-${Date.now()}`,
        created_at: new Date().toISOString(),
        auteur: form.auteur.trim(),
        note: form.note,
        texte: form.texte.trim() || undefined,
        photos: photos.map((p) => p.preview),
      }, ...prev]);
    } catch {
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map((n) => ({
    note: n,
    count: reviews.filter((r) => r.note === n).length,
  }));

  return (
    <div className="mt-12 pt-10 border-t" style={{ borderColor: "var(--border)" }}>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold uppercase tracking-wider text-white mb-2" style={{ fontFamily: "var(--font-syne)" }}>
            Avis clients
          </h3>
          {!loading && reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Stars note={Math.round(avgNote)} />
              <span className="text-sm font-bold text-white">{avgNote.toFixed(1)}</span>
              <span className="text-sm text-[#6b7280]">· {reviews.length} avis</span>
            </div>
          )}
        </div>
        {!submitted && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex-shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            style={{
              background: showForm ? "rgba(107,63,160,0.15)" : "var(--surface)",
              border: `1px solid ${showForm ? "rgba(107,63,160,0.4)" : "var(--border)"}`,
              color: showForm ? "var(--violet-light)" : "var(--text-secondary)",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {showForm ? "Annuler" : "Laisser un avis"}
          </button>
        )}
      </div>

      {/* Rating distribution */}
      {!loading && reviews.length > 0 && (
        <div className="mb-6 p-4 rounded-xl space-y-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          {ratingDistribution.map(({ note, count }) => (
            <div key={note} className="flex items-center gap-3 text-xs">
              <span className="text-[#9ca3af] w-4 text-right">{note}</span>
              <svg className="w-3 h-3 text-[#f59e0b] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#1f1f1f]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  }}
                />
              </div>
              <span className="text-[#6b7280] w-4">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Success */}
      {submitted && (
        <div className="mb-6 p-4 rounded-xl text-sm text-green-300 flex items-center gap-2" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Merci pour votre avis ! Il est maintenant visible.
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 rounded-2xl space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-2 uppercase tracking-wider">Note *</label>
            <StarPicker value={form.note} onChange={(n) => setForm((p) => ({ ...p, note: n }))} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1.5 uppercase tracking-wider">Votre nom *</label>
            <input
              type="text"
              value={form.auteur}
              onChange={(e) => setForm((p) => ({ ...p, auteur: e.target.value }))}
              required
              maxLength={80}
              placeholder="Prénom ou pseudo"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-1.5 uppercase tracking-wider">Votre avis</label>
            <textarea
              value={form.texte}
              onChange={(e) => setForm((p) => ({ ...p, texte: e.target.value }))}
              rows={4}
              maxLength={2000}
              placeholder="Partagez votre expérience avec ce produit..."
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] mb-2 uppercase tracking-wider">
              Photos ({photos.length}/3)
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <img src={p.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white text-xs hover:bg-black/90"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 text-[#6b7280] hover:text-white hover:border-[#4a4a4a] transition-colors flex-shrink-0"
                  style={{ border: "1.5px dashed var(--border)" }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-[10px]">Ajouter</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-[10px] text-[#4b5563] mt-1.5">Max 3 photos · 2 Mo chacune</p>
          </div>

          <button
            type="submit"
            disabled={submitting || form.note === 0 || !form.auteur.trim()}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Envoi en cours…
              </>
            ) : "Publier mon avis"}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[#6b7280] text-sm mb-1">Aucun avis pour ce produit</p>
          <p className="text-[#4b5563] text-xs">Soyez le premier à partager votre expérience</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, var(--violet), var(--violet-dark))" }}
                  >
                    {review.auteur.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none mb-0.5">{review.auteur}</p>
                    <p className="text-[10px] text-[#6b7280]">
                      {new Date(review.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <Stars note={review.note} />
              </div>

              {review.texte && (
                <p className="text-sm text-[#9ca3af] leading-relaxed">{review.texte}</p>
              )}

              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {review.photos.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox(url)}
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
