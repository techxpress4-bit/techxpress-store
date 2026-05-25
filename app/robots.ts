import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/auth/", "/login", "/api/", "/commander", "/confirmation", "/panier"],
      },
    ],
    sitemap: "https://techxpressdz.com/sitemap.xml",
    host: "https://techxpressdz.com",
  };
}
