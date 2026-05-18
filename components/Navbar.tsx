"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CartModal from "./CartModal";
import { createClient } from "@/lib/supabase/client";
import { client as sanityClient } from "@/lib/sanity";
import type { User } from "@supabase/supabase-js";

interface SearchProduct {
  _id: string;
  nom: string;
  slug: { current: string };
  prix: number;
  categorie?: { nom: string; slug: { current: string } };
}

interface CategoryItem {
  nom: string;
  searchNom: string;
  slug: string;
}

interface SearchSuggestions {
  categories: CategoryItem[];
  products: SearchProduct[];
}

function normalize(str: string) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const categories = [
  { nom: "Box TV Android",    searchNom: "Box TV Android",          slug: "box-tv-android" },
  { nom: "Abonnements TV",    searchNom: "Abonnements TV",           slug: "abonnements-tv" },
  { nom: "Accessoires Tél.", searchNom: "Accessoires Telephone",    slug: "accessoires-telephone" },
  { nom: "Routeurs",          searchNom: "Routeurs Modem",           slug: "routeur-modem" },
  { nom: "Câbles",            searchNom: "Cables",                   slug: "cables" },
  { nom: "Supports TV",       searchNom: "Supports TV",              slug: "support-tv" },
  { nom: "Paraboles",         searchNom: "Paraboles",                slug: "paraboles" },
];

export default function Navbar() {
  const { totalItems, isOpen, closeModal } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ categories: [], products: [] });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const pathname = usePathname();
  const router = useRouter();

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions({ categories: [], products: [] });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  }

  const isAccueilActive = pathname === '/';
  const isCatalogueActive = pathname.startsWith('/catalogue') || pathname.startsWith('/produit');
  const isContactActive = pathname === '/contact';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    sanityClient
      .fetch<SearchProduct[]>(
        `*[_type == "product"] | order(nom asc) { _id, nom, slug, prix, categorie->{ nom, slug } }`
      )
      .then(setAllProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions({ categories: [], products: [] });
      return;
    }
    const nq = normalize(q);
    const matchedCats = categories.filter((cat) =>
      normalize(cat.searchNom).includes(nq)
    );
    const matchedProducts = allProducts
      .filter((p) => normalize(p.nom).includes(nq))
      .slice(0, 5);
    setSuggestions({ categories: matchedCats.slice(0, 3), products: matchedProducts });
  }, [searchQuery, allProducts]);

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
              <Link href="/" className={`btn-ghost text-sm relative ${isAccueilActive ? 'text-white' : ''}`}>
                Accueil
                {isAccueilActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: 'var(--violet)' }} />}
              </Link>
              <div className="relative group">
                <Link
                  href="/catalogue"
                  className={`btn-ghost text-sm flex items-center gap-1 relative ${isCatalogueActive ? 'text-white' : ''}`}
                >
                  Catalogue
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  {isCatalogueActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: 'var(--violet)' }} />}
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
              <Link href="/contact" className={`btn-ghost text-sm relative ${isContactActive ? 'text-white' : ''}`}>
                Contact
                {isContactActive && <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full" style={{ background: 'var(--violet)' }} />}
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-violet hover:bg-[rgba(107,63,160,0.1)] transition-all duration-200"
                aria-label="Rechercher un produit"
                aria-expanded={searchOpen}
              >
                <svg className="w-4 h-4 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Login / User */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-[#9ca3af] max-w-[120px] truncate">
                    {user.user_metadata?.prenom || user.email?.split("@")[0]}
                  </span>
                  <Link
                    href="/account"
                    className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-violet hover:bg-[rgba(107,63,160,0.1)] transition-all duration-200 text-xs font-semibold text-[#9ca3af] hover:text-white"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                    Mes commandes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-[#2a2a2a] bg-[#161616] hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-200 text-xs font-semibold text-[#9ca3af] hover:text-red-400"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Déconnexion
                  </button>
                </div>
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

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#2a2a2a] bg-[#161616]"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={menuOpen}
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
          {searchOpen && (
            <div className="border-t border-[#2a2a2a] py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280] pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un produit ou une catégorie..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#161616] border border-[#2a2a2a] text-white placeholder-[#6b7280] focus:outline-none focus:border-[var(--violet)] transition-colors"
                  />

                  {/* Dropdown suggestions */}
                  {(suggestions.categories.length > 0 || suggestions.products.length > 0) && (
                    <div
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-2xl shadow-black/70 z-50"
                      style={{ background: "#111", border: "1px solid #2a2a2a" }}
                    >
                      {/* Catégories */}
                      {suggestions.categories.length > 0 && (
                        <div>
                          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                            Catégories
                          </p>
                          {suggestions.categories.map((cat) => (
                            <Link
                              key={cat.slug}
                              href={`/catalogue/${cat.slug}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={closeSearch}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors"
                            >
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(107,63,160,0.2)", border: "1px solid rgba(107,63,160,0.35)" }}
                              >
                                <svg className="w-3 h-3 text-[#c084fc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                              </div>
                              <span className="text-sm text-white font-medium flex-1">{cat.nom}</span>
                              <span className="text-xs text-[#6b7280]">Catégorie →</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Séparateur */}
                      {suggestions.categories.length > 0 && suggestions.products.length > 0 && (
                        <div className="mx-4 h-px bg-[#2a2a2a]" />
                      )}

                      {/* Produits */}
                      {suggestions.products.length > 0 && (
                        <div>
                          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6b7280]">
                            Produits
                          </p>
                          {suggestions.products.map((p) => (
                            <Link
                              key={p._id}
                              href={`/produit/${p.slug.current}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={closeSearch}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors"
                            >
                              <div
                                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                              >
                                <svg className="w-3 h-3 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                              </div>
                              <span className="text-sm text-white font-medium flex-1 line-clamp-1">{p.nom}</span>
                              <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--violet-light)" }}>
                                {p.prix.toLocaleString("fr-DZ")} DA
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Voir tous les résultats */}
                      <div className="border-t border-[#2a2a2a]">
                        <button
                          type="submit"
                          onMouseDown={(e) => e.preventDefault()}
                          className="w-full px-4 py-2.5 text-xs text-[#6b7280] hover:text-white hover:bg-[#1a1a1a] transition-colors text-left flex items-center gap-2"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Voir tous les résultats pour &quot;{searchQuery}&quot;
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Aucun résultat */}
                  {searchQuery.trim().length >= 2 &&
                    suggestions.categories.length === 0 &&
                    suggestions.products.length === 0 && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 rounded-xl px-4 py-3 text-center"
                        style={{ background: "#111", border: "1px solid #2a2a2a" }}
                      >
                        <p className="text-sm text-[#6b7280]">Aucun résultat pour &quot;{searchQuery}&quot;</p>
                      </div>
                    )}
                </div>
                <button type="submit" className="btn-primary text-sm px-4 py-2.5 flex-shrink-0">
                  Rechercher
                </button>
                <button type="button" onClick={closeSearch} className="text-[#6b7280] hover:text-white transition-colors p-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
          )}
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
              {user ? (
                <>
                  <Link href="/account" className="block px-4 py-2.5 rounded-xl text-sm text-[#9ca3af] hover:text-white hover:bg-[#161616] transition-colors" onClick={() => setMenuOpen(false)}>
                    Mes commandes
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#9ca3af] hover:text-red-400 hover:bg-[#161616] transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[#9ca3af] hover:text-white hover:bg-[#161616] transition-colors" onClick={() => setMenuOpen(false)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {isOpen && <CartModal />}
    </>
  );
}
