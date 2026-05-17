import { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity";
import { allProductsQuery, allCategoriesQuery } from "@/lib/queries";
import type { Product, Category } from "@/lib/types";
import CatalogueClient from "./CatalogueClient";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Tous nos produits électroniques : Box TV Android, accessoires téléphone, routeurs, câbles, paraboles et plus.",
};

export default async function CataloguePage() {
  const [products, categories] = await Promise.all([
    sanityFetch<Product[]>(allProductsQuery),
    sanityFetch<Category[]>(allCategoriesQuery),
  ]);

  return <CatalogueClient products={products} categories={categories} />;
}
