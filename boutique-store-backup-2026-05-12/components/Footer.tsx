import Link from "next/link";

const categories = [
  { nom: "Box TV Android", slug: "box-tv-android" },
  { nom: "Abonnements TV", slug: "abonnements-tv" },
  { nom: "Accessoires Téléphone", slug: "accessoires-telephone" },
  { nom: "Routeur / Modem", slug: "routeur-modem" },
  { nom: "Câbles", slug: "cables" },
  { nom: "Supports TV", slug: "support-tv" },
  { nom: "Paraboles", slug: "paraboles" },
];

export default function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  return (
    <footer className="border-t border-[#2a2a2a] bg-[#0a0a0a] mt-20">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex mb-4">
              <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}>
                Tech<span style={{ color: "var(--violet)" }}>XpressDZ</span>
              </span>
            </Link>
            <p className="text-sm text-[#6b7280] leading-relaxed mb-5">
              Votre destination premium pour les produits électroniques et multimédias en Algérie. Livraison dans les 58 wilayas.
            </p>
            {/* Payment method badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#161616] text-xs text-[#9ca3af]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Paiement à la livraison uniquement
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
              Catégories
            </h3>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalogue/${cat.slug}`}
                    className="text-sm text-[#6b7280] hover:text-[#8b5fc0] transition-colors"
                  >
                    {cat.nom}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Accueil", href: "/" },
                { label: "Catalogue", href: "/catalogue" },
                { label: "Mon panier", href: "/panier" },
                { label: "Commander", href: "/commander" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6b7280] hover:text-[#8b5fc0] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-syne)" }}>
              Contact
            </h3>
            <ul className="space-y-3">
              {whatsapp && (
                <li>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-[#6b7280] hover:text-[#25D366] transition-colors group"
                  >
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#161616] border border-[#2a2a2a] group-hover:border-[#25D366] group-hover:bg-[rgba(37,211,102,0.1)] transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </span>
                    WhatsApp
                  </a>
                </li>
              )}
              <li>
                <a
                  href="https://www.instagram.com/dztechxpress?igsh=dTJxdnFueGg0Y3E5&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[#6b7280] hover:text-[#E1306C] transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#161616] border border-[#2a2a2a] group-hover:border-[#E1306C] group-hover:bg-[rgba(225,48,108,0.1)] transition-all">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </span>
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@techxpress23?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-[#6b7280] hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#161616] border border-[#2a2a2a] group-hover:border-white group-hover:bg-[rgba(255,255,255,0.05)] transition-all">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
                    </svg>
                  </span>
                  TikTok
                </a>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2.5 text-sm text-[#6b7280] hover:text-[#8b5fc0] transition-colors group">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#161616] border border-[#2a2a2a] group-hover:border-violet transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Formulaire de contact
                </Link>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#6b7280]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-medium text-[#9ca3af]">Disponible</span>
              </div>
              Livraison dans toute l'Algérie — Paiement à la livraison (COD)
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#4b5563]">
            © {new Date().getFullYear()} Tech Xpress. Tous droits réservés. Algérie 🇩🇿
          </p>
          <p className="text-xs text-[#4b5563]">
            Paiement à la livraison • Sans paiement en ligne
          </p>
        </div>
      </div>
    </footer>
  );
}
