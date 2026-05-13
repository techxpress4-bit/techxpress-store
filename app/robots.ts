import { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://techxpressdz.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/mes-commandes",
          "/panier",
          "/commander",
          "/confirmation",
          "/api/",
          "/studio/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
