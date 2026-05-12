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

const productImages: Record<string, string> = {
  "Xiaomi TV Box 4K 2ème Génération":
    "https://www.androidtv-guide.com/wp-content/uploads/2022/12/xiaomi-box-s-v2-medium.png",
  "Xiaomi TV Stick 4K 2ème Génération":
    "https://www.androidtv-guide.com/wp-content/uploads/2025/07/xiaomi-tv-stick-2025-medium.png",
  "Box Watch ONN 4K":
    "https://www.thetedstore.com/cdn/shop/files/2d2d791e-bf02-4632-8d5a-3afaf7f69eee.jpg?v=1743634824&width=1946",
  "Box Watch ONN 4K Plus":
    "https://www.thetedstore.com/cdn/shop/files/adefac86-14d7-4a70-ab57-c2b672af5f16.jpg?v=1743634824&width=1946",
  "Box Watch ONN Stick HD":
    "https://9to5google.com/wp-content/uploads/sites/4/2026/05/onn-4k-google-tv-stick-2.jpg?quality=82&strip=all&w=1024",
  "Box Watch ONN 4K Pro":
    "https://9to5google.com/wp-content/uploads/sites/4/2026/05/chromecast-onn-4k-streaming-stick-google-tv.jpg?quality=82&strip=all&w=1600",
  "Box Mecool KM2 Plus":
    "https://www.mecool.com/cdn/shop/products/MECOOLKM2PLUS_1_1000x.jpg?v=1770006173",
  "Box Mecool KM7 Plus":
    "https://www.mecool.com/cdn/shop/products/MECOOLKM7PLUSTVBOX_1_1000x.jpg?v=1671072417",
  "Box Mecool KM2 Plus Deluxe":
    "https://www.mecool.com/cdn/shop/files/KM2PLUSDELUXE1_1800x.jpg?v=1702546992",
  "Box Rocktek GX1":
    "https://www.androidtv-guide.com/wp-content/uploads/2024/12/rocktek-gx1-medium.png",
  "Box Rocktek G2":
    "https://droix.net/wp-content/uploads/2024/02/ROCKTEK-G2-LISTING-DONE-01.png",
  "Box Rocktek GT1":
    "https://www.androidtv-guide.com/wp-content/uploads/2024/12/rocktek-gt1-medium.png",
  "Amazon Fire TV Stick 4K":
    "https://smartify.pt/cdn/shop/products/Amazon-Fire-Tv-Stick-4k-img1.webp?v=1702654579&width=1000",
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
          "Accept-Language": "en-US,en;q=0.9",
          Referer: new URL(url).origin + "/",
        },
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const location = res.headers.location;
          if (!location) return reject(new Error("Redirect without location"));
          const next = location.startsWith("http") ? location : new URL(location, url).href;
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
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function mimeFromUrl(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

async function uploadImages() {
  console.log("🖼️  Début de l'upload des photos...\n");

  const products = await client.fetch<{ _id: string; nom: string }[]>(
    `*[_type == "product"]{ _id, nom }`
  );

  console.log(`📦 ${products.length} produits trouvés\n`);

  let success = 0;
  let skipped = 0;

  for (const product of products) {
    const imageUrl = productImages[product.nom];

    if (!imageUrl) {
      console.log(`  ⏭️  ${product.nom} — aucune image trouvée`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  ⬇️  ${product.nom} ... `);

      const buffer = await downloadImage(imageUrl);
      const mime = mimeFromUrl(imageUrl);
      const ext = mime.split("/")[1].replace("jpeg", "jpg");

      const asset = await client.assets.upload("image", buffer, {
        contentType: mime,
        filename: `${product.nom
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")}.${ext}`,
      });

      await client
        .patch(product._id)
        .setIfMissing({ photos: [] })
        .append("photos", [
          {
            _type: "image",
            _key: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            asset: { _type: "reference", _ref: asset._id },
            alt: product.nom,
          },
        ])
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
    `\n✅ Terminé — ${success} photos uploadées, ${skipped} produits sans image disponible.`
  );
}

uploadImages().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
