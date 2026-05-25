"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import type { Product, Variante } from "@/lib/types";
import { sanityFetch } from "@/lib/sanity";
import { productBySlugQuery } from "@/lib/queries";
import ProductImageGallery from "./ProductImageGallery";
import AddToCartSection from "./AddToCartSection";
import ReviewSection from "@/components/ReviewSection";

export default function ProductPageClient() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variante | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    sanityFetch<Product | null>(productBySlugQuery, { slug })
      .then((data) => {
        if (!data) { setNotFound(true); return; }
        setProduct(data);
        setSelectedVariant(data.variantes?.[0] ?? null);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <ProductSkeleton />;

  if (notFound || !product) {
    return (
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[#6b7280]">Produit introuvable.</p>
          <Link href="/catalogue" className="btn-primary text-sm px-5 py-2.5">
            Retour au catalogue
          </Link>
        </div>
      </div>
    );
  }

  const images =
    selectedVariant?.photo
      ? [selectedVariant.photo]
      : product.photos || [];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-8 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
          {product.categorie && (
            <>
              <span>/</span>
              <Link href={`/catalogue/${product.categorie.slug.current}`} className="hover:text-white transition-colors">
                {product.categorie.nom}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-white truncate max-w-[200px]">{product.nom}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Galerie */}
          <ProductImageGallery images={images} productName={product.nom} enStock={product.enStock} />

          {/* Détails */}
          <div>
            {product.categorie && (
              <Link
                href={`/catalogue/${product.categorie.slug.current}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold mb-3 px-3 py-1 rounded-full transition-colors hover:text-white"
                style={{ color: "var(--violet-light)", background: "rgba(107,63,160,0.12)", border: "1px solid rgba(107,63,160,0.25)" }}
              >
                ← {product.categorie.nom}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "var(--font-syne)" }}>
              {product.nom}
            </h1>

            {(product.marque || product.reference) && (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {product.marque && (
                  <span className="text-xs font-semibold text-[#9ca3af] px-2.5 py-1 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    {product.marque}
                  </span>
                )}
                {product.reference && (
                  <span className="text-xs text-[#6b7280]">Réf : {product.reference}</span>
                )}
              </div>
            )}

            <AddToCartSection product={product} onVariantChange={setSelectedVariant} />

            {/* Fiche technique */}
            {product.ficheTechnique && product.ficheTechnique.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                  Fiche technique
                </h3>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {product.ficheTechnique.map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-[#111]" : "bg-[#161616]"}`}>
                      <span className="text-[#6b7280] font-medium w-32 flex-shrink-0">{item.cle}</span>
                      <span className="text-[#f5f5f5]">{item.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && product.description.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                  Description
                </h3>
                <div className="text-sm leading-relaxed space-y-3">
                  <PortableText
                    value={product.description}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="text-[#9ca3af]">{children}</p>,
                        h2: ({ children }) => <h2 className="text-base font-bold text-white mt-5 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold text-white mt-4 mb-1">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-sm font-semibold text-[#d1d5db] mt-3 mb-1">{children}</h4>,
                      },
                      list: {
                        bullet: ({ children }) => <ul className="list-disc list-inside space-y-1 text-[#9ca3af] pl-2">{children}</ul>,
                        number: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-[#9ca3af] pl-2">{children}</ol>,
                      },
                      listItem: {
                        bullet: ({ children }) => <li className="text-[#9ca3af]">{children}</li>,
                        number: ({ children }) => <li className="text-[#9ca3af]">{children}</li>,
                      },
                      marks: {
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic text-[#9ca3af]">{children}</em>,
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Infos livraison */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: "🚚", text: "Livraison dans 58 wilayas" },
                { icon: "💵", text: "Paiement à la livraison" },
                { icon: "🛡️", text: product.garantie ? `Garantie ${product.garantie} mois` : "Produit garanti" },
                { icon: "📞", text: "Support WhatsApp" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 p-3 rounded-xl text-xs text-[#9ca3af]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ReviewSection productSlug={product.slug.current} />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-5 w-64 skeleton mb-8 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl skeleton" />
            <div className="flex gap-3">
              {[1, 2, 3].map((i) => <div key={i} className="w-20 h-20 rounded-xl skeleton flex-shrink-0" />)}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-4 w-24 skeleton rounded" />
            <div className="h-10 w-3/4 skeleton rounded-lg" />
            <div className="h-12 w-1/2 skeleton rounded-lg" />
            <div className="h-32 w-full skeleton rounded-xl" />
            <div className="h-14 w-full skeleton rounded-xl" />
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 skeleton rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
