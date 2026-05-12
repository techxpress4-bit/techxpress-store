import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { sanityFetch, urlFor } from "@/lib/sanity";
import { productBySlugQuery } from "@/lib/queries";
import type { Product } from "@/lib/types";
import AddToCartSection from "./AddToCartSection";
import ProductGallery from "./ProductGallery";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await sanityFetch<Product>(productBySlugQuery, { slug });
  if (!product) return { title: "Produit introuvable" };
  const imageUrl =
    product.photos?.[0]
      ? urlFor(product.photos[0]).width(800).url()
      : undefined;
  return {
    title: product.nom,
    description: `${product.nom} — ${product.prix.toLocaleString("fr-DZ")} DA. Disponible chez Tech Xpress, livraison dans toute l'Algérie.`,
    openGraph: {
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await sanityFetch<Product>(productBySlugQuery, { slug });

  if (!product) notFound();

  const images = product.photos || [];
  const mainImage = images[0]
    ? urlFor(images[0]).width(800).height(800).fit("crop").url()
    : null;

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
          {/* Images */}
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

            {/* Add to cart section (client component — includes dynamic price) */}
            <AddToCartSection product={product} />

            {/* Fiche technique */}
            {product.ficheTechnique && product.ficheTechnique.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                  Fiche technique
                </h3>
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

            {/* Description */}
            {product.description && product.description.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4" style={{ fontFamily: "var(--font-syne)" }}>
                  Description
                </h3>
                <div className="text-[#9ca3af] text-sm leading-relaxed space-y-3">
                  {product.description.map((block: any) =>
                    block._type === "block" && block.children ? (
                      <p key={block._key}>
                        {block.children.map((child: any) => child.text).join("")}
                      </p>
                    ) : null
                  )}
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
