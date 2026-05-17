import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import path from "path";
import https from "https";
import http from "http";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Unsplash + other free sources — one premium image per category
const categoryImages: Record<string, { url: string; alt: string }> = {
  "box-tv-android": {
    url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1200&q=85&auto=format&fit=crop",
    alt: "Box TV Android 4K streaming",
  },
  "abonnements-tv": {
    url: "https://images.unsplash.com/photo-1647804860011-3d88926953e2?w=1200&q=85&auto=format&fit=crop",
    alt: "Abonnements IPTV et streaming TV",
  },
  "accessoires-telephone": {
    url: "https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=1200&q=85&auto=format&fit=crop",
    alt: "Accessoires téléphone chargeurs coques",
  },
  "routeur-modem": {
    url: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=1200&q=85&auto=format&fit=crop",
    alt: "Routeur WiFi modem haut débit",
  },
  cables: {
    url: "https://images.unsplash.com/photo-1583259034006-5ea8361109e7?w=1200&q=85&auto=format&fit=crop",
    alt: "Câbles HDMI USB réseau",
  },
  "support-tv": {
    url: "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=1200&q=85&auto=format&fit=crop",
    alt: "Support TV mural salon",
  },
  paraboles: {
    url: "https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=1200&q=85&auto=format&fit=crop",
    alt: "Antenne parabolique satellite",
  },
};

function downloadImage(url: string, redirectCount = 0): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error("Too many redirects"));
    const protocol = url.startsWith("https") ? https : http;
    const req = protocol.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          Accept: "image/*,*/*;q=0.8",
        },
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location;
          if (!loc) return reject(new Error("Redirect without location"));
          const next = loc.startsWith("http") ? loc : new URL(loc, url).href;
          downloadImage(next, redirectCount + 1).then(resolve).catch(reject);
          res.resume();
          return;
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function uploadCategoryImages() {
  console.log("🖼️  Upload des images de catégories...\n");

  const categories = await client.fetch<{ _id: string; nom: string; slug: { current: string } }[]>(
    `*[_type == "category"]{ _id, nom, slug }`
  );

  console.log(`📦 ${categories.length} catégories trouvées\n`);

  // Deduplicate by slug (keep first occurrence)
  const seen = new Set<string>();
  const unique = categories.filter((c) => {
    const s = c.slug?.current;
    if (!s || seen.has(s)) return false;
    seen.add(s);
    return true;
  });

  let success = 0;
  let skipped = 0;

  for (const cat of unique) {
    const slug = cat.slug?.current;
    const entry = slug ? categoryImages[slug] : undefined;

    if (!entry) {
      console.log(`  ⏭️  ${cat.nom} (${slug}) — aucune image`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  ⬇️  ${cat.nom} ... `);

      const buffer = await downloadImage(entry.url);

      const asset = await client.assets.upload("image", buffer, {
        contentType: "image/jpeg",
        filename: `category-${slug}.jpg`,
      });

      await client
        .patch(cat._id)
        .set({
          image: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
            alt: entry.alt,
          },
        })
        .commit();

      console.log(`✅`);
      success++;

      await new Promise((r) => setTimeout(r, 400));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`❌  ${msg}`);
    }
  }

  console.log(
    `\n✅ Terminé — ${success} images de catégories uploadées, ${skipped} ignorées.`
  );
}

uploadCategoryImages().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
