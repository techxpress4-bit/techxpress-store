"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import type { User } from "@supabase/supabase-js";

interface Profile {
  prenom?: string;
  nom?: string;
  telephone?: string;
  newsletter_opt_in?: boolean;
}

export default function AccountClient() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newsletter, setNewsletter] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(prof);
      setNewsletter(prof?.newsletter_opt_in ?? true);
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleNewsletterToggle() {
    if (!user) return;
    setSaving(true);
    const next = !newsletter;
    setNewsletter(next);
    const { error } = await supabase
      .from("profiles")
      .update({ newsletter_opt_in: next })
      .eq("id", user.id);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
      setNewsletter(!next);
    } else {
      toast.success(next ? "Abonné aux offres TechXpress" : "Désabonné des offres");
    }
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <p className="text-[#6b7280]">Chargement…</p>
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.prenom
    ? `${profile.prenom}${profile.nom ? " " + profile.nom : ""}`
    : user.email?.split("@")[0] ?? "Utilisateur";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--violet), var(--violet-dark))", boxShadow: "0 8px 24px var(--violet-glow)" }}>
            {initial}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
              {displayName}
            </h1>
            <p className="text-sm text-[#6b7280]">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile info */}
          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] mb-5" style={{ fontFamily: "var(--font-syne)" }}>
              Informations
            </h2>
            <dl className="space-y-4">
              {[
                { label: "Prénom", value: profile?.prenom || "—" },
                { label: "Nom", value: profile?.nom || "—" },
                { label: "Téléphone", value: profile?.telephone || "—" },
                { label: "Email", value: user.email || "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#1f1f1f] last:border-0">
                  <dt className="text-xs text-[#6b7280] font-medium w-28">{label}</dt>
                  <dd className="text-sm text-[#f5f5f5] text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Newsletter */}
          <div className="card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "var(--font-syne)" }}>
                  Offres &amp; Promotions
                </h2>
                <p className="text-xs text-[#6b7280] leading-relaxed max-w-xs">
                  Recevoir les offres exclusives et nouveautés TechXpress par email.
                </p>
              </div>
              <button
                onClick={handleNewsletterToggle}
                disabled={saving}
                aria-label="Toggle newsletter"
                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${newsletter ? "" : "bg-[#2a2a2a]"}`}
                style={newsletter ? { background: "var(--violet)", boxShadow: "0 0 12px var(--violet-glow)" } : {}}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${newsletter ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9ca3af] mb-4" style={{ fontFamily: "var(--font-syne)" }}>
              Mon espace
            </h2>
            <Link href="/panier" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#1f1f1f] transition-colors group">
              <div className="flex items-center gap-3 text-sm text-[#9ca3af] group-hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Mon panier
              </div>
              <svg className="w-4 h-4 text-[#4b5563] group-hover:text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/catalogue" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#1f1f1f] transition-colors group">
              <div className="flex items-center gap-3 text-sm text-[#9ca3af] group-hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Catalogue
              </div>
              <svg className="w-4 h-4 text-[#4b5563] group-hover:text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            style={{ border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
