"use client";

import { useEffect, useState } from "react";
import { sanityFetch } from "@/lib/sanity";
import { bestSellersQuery, featuredProductsQuery } from "@/lib/queries";
import type { Product } from "@/lib/types";
import ProductCarousel from "./ProductCarousel";
import { ProductGridSkeleton } from "./ProductCardSkeleton";

export default function BestSellersClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sanityFetch<{ produits: Product[] } | null>(bestSellersQuery)
      .then(async (data) => {
        const produits = data?.produits ?? [];
        if (produits.length > 0) {
          setProducts(produits);
        } else {
          // Fallback : produits marqués "featured" si le singleton n'est pas encore configuré
          const fallback = await sanityFetch<Product[]>(featuredProductsQuery);
          setProducts(fallback ?? []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return <ProductCarousel products={products} />;
}
