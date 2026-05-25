import { Metadata } from "next";
import { sanityFetch, urlFor } from "@/lib/sanity";
import { productBySlugQuery } from "@/lib/queries";
import type { Product } from "@/lib/types";
import ProductPageClient from "./ProductPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: { current: string } }[]>(
    `*[_type == "product"]{ slug }`
  );
  return slugs.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await sanityFetch<Product>(productBySlugQuery, { slug });
  if (!product) return { title: "Produit introuvable" };
  const imageUrl = product.photos?.[0]
    ? urlFor(product.photos[0]).width(1200).url()
    : undefined;
  return {
    title: `${product.nom} — TechXpress DZ`,
    description: `${product.nom} — ${product.prix.toLocaleString("fr-DZ")} DA. Disponible chez Tech Xpress, livraison dans toute l'Algérie.`,
    openGraph: { images: imageUrl ? [imageUrl] : [] },
  };
}

function buildJsonLd(product: Product) {
  const today = new Date().toISOString().split("T")[0];
  const promoActive =
    !!product.prixPromo &&
    product.prixPromo < product.prix &&
    (!product.dateFinPromo || product.dateFinPromo >= today);
  const price = promoActive ? product.prixPromo! : product.prix;
  const image = product.photos?.[0]
    ? urlFor(product.photos[0]).width(1200).height(1200).url()
    : undefined;
  const desc =
    product.description
      ?.map((b) =>
        (b as { children?: { text?: string }[] })?.children
          ?.map((c) => c.text)
          .join("")
      )
      .join(" ")
      .trim() || product.nom;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.nom,
    image: image ? [image] : undefined,
    description: desc,
    sku: product.reference || product._id,
    brand: product.marque ? { "@type": "Brand", name: product.marque } : undefined,
    category: product.categorie?.nom,
    offers: {
      "@type": "Offer",
      url: `https://techxpressdz.com/produit/${product.slug.current}`,
      priceCurrency: "DZD",
      price,
      priceValidUntil: product.dateFinPromo || undefined,
      availability: product.enStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Tech Xpress DZ" },
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await sanityFetch<Product | null>(productBySlugQuery, { slug });

  return (
    <>
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(product)) }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
