import { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://techxpressdz.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    sanityFetch<{ slug: { current: string }; _createdAt: string }[]>(
      `*[_type == "product"] { slug, _createdAt }`,
      {},
      { revalidate: 3600 }
    ),
    sanityFetch<{ slug: { current: string } }[]>(
      `*[_type == "category"] { slug }`,
      {},
      { revalidate: 3600 }
    ),
  ]);

  return [
    { url: base,                     changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/catalogue`,      changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/contact`,        changeFrequency: "monthly", priority: 0.4 },
    ...categories.map((c) => ({
      url: `${base}/catalogue/${c.slug.current}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/produit/${p.slug.current}`,
      lastModified: new Date(p._createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
