import { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/lib/sanity";
import { allProductsQuery, allCategoriesQuery, categoryBySlugQuery } from "@/lib/queries";
import type { Product, Category } from "@/lib/types";
import CatalogueClient from "../CatalogueClient";

interface Props {
  params: Promise<{ categorie: string }>;
}

export async function generateStaticParams() {
  const categories = await sanityFetch<{ slug: { current: string } }[]>(
    `*[_type == "category"]{ slug }`
  );
  return categories.map((c) => ({ categorie: c.slug.current }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const cat = await sanityFetch<Category>(categoryBySlugQuery, { slug: categorie });
  if (!cat) return { title: "Catégorie introuvable" };
  return {
    title: cat.nom,
    description: cat.description || `Tous nos produits ${cat.nom} — Tech Xpress Algérie`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorie } = await params;

  const [cat, products, categories] = await Promise.all([
    sanityFetch<Category>(categoryBySlugQuery, { slug: categorie }),
    sanityFetch<Product[]>(allProductsQuery),
    sanityFetch<Category[]>(allCategoriesQuery),
  ]);

  if (!cat) notFound();

  return (
    <CatalogueClient
      products={products}
      categories={categories}
      currentCategorySlug={categorie}
    />
  );
}
