import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity";

export const dynamic = "force-static";

const SITE_URL = "https://techxpressdz.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/catalogue`,         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/contact`,           lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${SITE_URL}/cgv`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/mentions-legales`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/confidentialite`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/politique-retour`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  let categories: { slug: { current: string }; _updatedAt?: string }[] = [];
  let products: { slug: { current: string }; _updatedAt?: string }[] = [];

  try {
    categories = await sanityFetch(`*[_type=="category" && defined(slug.current) && count(*[_type == "product" && references(^._id)]) > 0]{slug, _updatedAt}`);
    products   = await sanityFetch(`*[_type=="product"  && defined(slug.current)]{slug, _updatedAt}`);
  } catch {
    // Fallback : on retourne juste les pages statiques si Sanity est indisponible
    return staticRoutes;
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/catalogue/${c.slug.current}`,
    lastModified: c._updatedAt ? new Date(c._updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/produit/${p.slug.current}`,
    lastModified: p._updatedAt ? new Date(p._updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
