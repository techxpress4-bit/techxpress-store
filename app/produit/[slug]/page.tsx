import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { sanityFetch, urlFor } from "@/lib/sanity";
import { productBySlugQuery } from "@/lib/queries";
import type { Product, PortableTextBlock } from "@/lib/types";
import AddToCartSection from "./AddToCartSection";
import ProductGallery from "./ProductGallery";

interface Props {
  params: Promise<{ slug: string }>;
}

function toPlainText(blocks: PortableTextBlock[]): string {
  return blocks
    .filter((b) => b._type === "block" && Array.isArray(b.children))
    .map((b) => (b.children as { text: string }[]).map((c) => c.text).join(""))
    .join(" ")
    .slice(0, 155);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await sanityFetch<Product>(productBySlugQuery, { slug });
  if (!product) return { title: "Produit introuvable" };

  const imageUrl = product.photos?.[0]
    ? urlFor(product.photos[0]).width(1200).height(630).fit("crop").url()
    : undefined;

  const autoDesc = product.description?.length
    ? toPlainText(product.description)
    : `${product.nom} — ${product.prix.toLocaleString("fr-DZ")} DA. Livraison dans toute l'Algérie.`;

  const seoTitle = product.metaTitre || product.nom;
  const seoDesc = product.metaDescription || autoDesc;

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: `${seoTitle} — TechXpressDZ`,
      description: seoDesc,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: seoTitle }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await sanityFetch<Product>(productBySlugQuery, { slug });

  if (!product) notFound();

  const images = product.photos || [];
  const mainImageUrl = images[0]
    ? urlFor(images[0]).width(1200).height(1200).fit("crop").url()
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nom,
    image: mainImageUrl ? [mainImageUrl] : undefined,
    description: product.description?.length
      ? toPlainText(product.description)
      : product.nom,
    brand: { "@type": "Brand", name: product.marque || "TechXpressDZ" },
    offers: {
      "@type": "Offer",
      price: product.prixPromo ?? product.prix,
      priceCurrency: "DZD",
      availability: product.enStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "TechXpressDZ" },
      priceValidUntil: new Date(Date.now() + 30 * 86400_000).toISOString().split("T")[0],
    },
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[#6b7280] mb-8 flex-wrap" aria-label="Fil d'Ariane">
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
          {/* Gallery */}
          <ProductGallery images={images} nom={product.nom} enStock={product.enStock} />

          {/* Details */}
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

            <AddToCartSection product={product} />

            {/* Fiche technique */}
            {product.ficheTechnique && product.ficheTechnique.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                  Fiche technique
                </h2>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {product.ficheTechnique.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-[#111]" : "bg-[#161616]"}`}
                    >
                      <span className="text-[#6b7280] font-medium w-32 flex-shrink-0">{item.cle}</span>
                      <span className="text-[#f5f5f5]">{item.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description — PortableText */}
            {product.description && product.description.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                  Description
                </h2>
                <div className="text-[#9ca3af] text-sm leading-relaxed space-y-3">
                  <PortableText
                    value={product.description}
                    components={{
                      block: {
                        normal: ({ children }) => <p className="leading-relaxed">{children}</p>,
                        h2: ({ children }) => <h2 className="text-white font-semibold text-base mt-4 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-white font-semibold mt-3 mb-1">{children}</h3>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 pl-4 italic text-[#6b7280]" style={{ borderColor: "var(--violet)" }}>
                            {children}
                          </blockquote>
                        ),
                      },
                      marks: {
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        link: ({ value, children }) => (
                          <a href={value?.href} target="_blank" rel="noopener noreferrer" className="text-[#c084fc] hover:underline">
                            {children}
                          </a>
                        ),
                      },
                      list: {
                        bullet: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                        number: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                      },
                      listItem: {
                        bullet: ({ children }) => <li>{children}</li>,
                        number: ({ children }) => <li>{children}</li>,
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {/* Delivery info */}
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { icon: "🚚", text: "Livraison dans 58 wilayas" },
                { icon: "💵", text: "Paiement à la livraison" },
                { icon: "🛡️", text: "Produit garanti" },
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
      </div>
    </div>
  );
}
