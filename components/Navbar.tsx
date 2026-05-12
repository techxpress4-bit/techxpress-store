"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartModal from "./CartModal";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const categories = [
  { nom: "Box TV Android", slug: "box-tv-android" },
  { nom: "Abonnements TV", slug: "abonnements-tv" },
  { nom: "Accessoires Tél.", slug: "accessoires-telephone" },
  { nom: "Routeurs", slug: "routeur-modem" },
  { nom: "Câbles", slug: "cables" },
  { nom: "Supports TV", slug: "support-tv" },
  { nom: "Paraboles", slug: "paraboles" },
];

export default function Navbar() {
  const { totalItems, isOpen, closeModal } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a] shadow-xl shadow-black/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span
                className="text-xl lg:text-2xl font-extrabold tracking-tight text-white group-hover:opacity-80 transition-opacity"
                style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}
              >
                Tech<span style={{ color: "var(--violet)" }}>XpressDZ</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="btn-ghost text-sm">
                Accueil
              </Link>
              <div className="relative group">
                <Link
                  href="/catalogue"
                  className="btn-ghost text-sm flex items-center gap-1"
                >
                  Catalogue
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                  <div className="card p-2 w-52 space-y-0.5 shadow-2xl shadow-black/70">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/catalogue/${cat.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9ca3af] hover:text-white hover:bg-[#1f1f1f] transition-colors"
                      >
                        {cat.nom}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <Link href="/contact" className="btn-ghost text-sm">
                Contact
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Login / User */}
              {user ? (
                <Link
                  href="/account"
                  className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-violet hover:bg-[rgba(107,63,160,0.1)] transition-all duration-200 text-xs font-semibold text-[#9ca3af] hover:text-white"
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                    style={{ background: "var(--violet)" }}>
                    {(user.user_metadata?.prenom || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[90px] truncate">
                    {user.user_metadata?.prenom || user.email?.split("@")[0]}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-violet hover:bg-[rgba(107,63,160,0.1)] transition-all duration-200 text-xs font-semibold text-[#9ca3af] hover:text-white"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </Link>
              )}

              {/* Panier */}
              <Link
                href="/panier"
                className="relative flex items-center gap-2 px-3 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-violet hover:bg-[rgba(107,63,160,0.1)] transition-all duration-200"
                aria-label="Mon panier"
              >
                <div className="relative flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white rounded-full leading-none px-1"
                      style={{ background: "var(--violet)", fontFamily: "var(--font-syne)" }}
                    >
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[#f5f5f5]">Mon Panier</span>
              </Link>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/dztechxpress?igsh=dTJxdnFueGg0Y3E5&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-[#E1306C] hover:bg-[rgba(225,48,108,0.1)] transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@techxpress23?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-white hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                </svg>
              </a>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#2a2a2a] bg-[#161616]"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[#2a2a2a] bg-[#0a0a0a]/98 backdrop-blur-md">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link href="/" className="block px-4 py-2.5 rounded-xl text-sm text-[#9ca3af] hover:text-white hover:bg-[#161616] transition-colors" onClick={() => setMenuOpen(false)}>
                Accueil
              </Link>
              <Link href="/catalogue" className="block px-4 py-2.5 rounded-xl text-sm text-[#9ca3af] hover:text-white hover:bg-[#161616] transition-colors" onClick={() => setMenuOpen(false)}>
                Tout le catalogue
              </Link>
              <div className="pl-4 border-l border-[#2a2a2a] space-y-1 ml-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/catalogue/${cat.slug}`}
                    className="block px-4 py-2 rounded-lg text-xs text-[#6b7280] hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {cat.nom}
                  </Link>
                ))}
              </div>
              <Link href="/contact" className="block px-4 py-2.5 rounded-xl text-sm text-[#9ca3af] hover:text-white hover:bg-[#161616] transition-colors" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
            </nav>
          </div>
        )}
      </header>

      {isOpen && <CartModal />}
    </>
  );
}
