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
    ? urlFor(product.photos[0]).width(800).url()
    : undefined;
  return {
    title: `${product.nom} — TechXpress DZ`,
    description: `${product.nom} — ${product.prix.toLocaleString("fr-DZ")} DA. Disponible chez Tech Xpress, livraison dans toute l'Algérie.`,
    openGraph: { images: imageUrl ? [imageUrl] : [] },
  };
}

export default function ProductPage() {
  return <ProductPageClient />;
}
