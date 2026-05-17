import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const categories = [
  { nom: "Box TV Android", slug: "box-tv-android", icone: "📺", ordre: 1, description: "Box TV Android pour accéder au streaming, IPTV et applications" },
  { nom: "Abonnements TV", slug: "abonnements-tv", icone: "📡", ordre: 2, description: "Abonnements IPTV et services de streaming" },
  { nom: "Accessoires Téléphone", slug: "accessoires-telephone", icone: "📱", ordre: 3, description: "Coques, chargeurs, écouteurs et accessoires" },
  { nom: "Routeur / Modem", slug: "routeur-modem", icone: "📶", ordre: 4, description: "Routeurs WiFi, modems ADSL et 4G" },
  { nom: "Câbles", slug: "cables", icone: "🔌", ordre: 5, description: "Câbles réseau, HDMI, DisplayPort, USB et plus" },
  { nom: "Support TV", slug: "support-tv", icone: "🖥️", ordre: 6, description: "Supports muraux, bras articulés pour téléviseurs" },
  { nom: "Paraboles", slug: "paraboles", icone: "🛰️", ordre: 7, description: "Antennes paraboliques et équipements satellite" },
];

const boxTVProducts = [
  { nom: "Xiaomi TV Box 4K 2ème Génération", prix: 12500, specs: [{ cle: "Résolution", valeur: "4K Ultra HD" }, { cle: "Processeur", valeur: "Amlogic S905X4" }, { cle: "RAM", valeur: "2 Go" }, { cle: "Stockage", valeur: "16 Go" }, { cle: "OS", valeur: "Android TV 11" }, { cle: "WiFi", valeur: "WiFi 5 (Dual Band)" }], featured: true },
  { nom: "Xiaomi TV Box 3ème Génération", prix: 9500, specs: [{ cle: "Résolution", valeur: "4K HDR" }, { cle: "Processeur", valeur: "Amlogic S905X3" }, { cle: "RAM", valeur: "2 Go" }, { cle: "Stockage", valeur: "8 Go" }, { cle: "OS", valeur: "Android TV 9" }, { cle: "Bluetooth", valeur: "Bluetooth 4.2" }], featured: false },
  { nom: "Xiaomi TV Stick 4K 2ème Génération", prix: 8500, specs: [{ cle: "Résolution", valeur: "4K Ultra HD" }, { cle: "Processeur", valeur: "Cortex-A35 Quad-Core" }, { cle: "RAM", valeur: "2 Go" }, { cle: "Stockage", valeur: "8 Go" }, { cle: "OS", valeur: "Android TV 11" }, { cle: "Format", valeur: "Stick HDMI" }], featured: true },
  { nom: "Dongle Stream 4K", prix: 10000, specs: [{ cle: "Résolution", valeur: "4K" }, { cle: "OS", valeur: "Android TV" }, { cle: "WiFi", valeur: "Dual Band" }, { cle: "Format", valeur: "Dongle HDMI" }], featured: false },
  { nom: "Box Watch ONN 4K", prix: 9000, specs: [{ cle: "Résolution", valeur: "4K Ultra HD" }, { cle: "OS", valeur: "Google TV" }, { cle: "WiFi", valeur: "WiFi 5" }, { cle: "Bluetooth", valeur: "Bluetooth 5.0" }], featured: false },
  { nom: "Box Watch ONN 4K Plus", prix: 11000, specs: [{ cle: "Résolution", valeur: "4K Ultra HD+" }, { cle: "OS", valeur: "Google TV" }, { cle: "HDR", valeur: "Dolby Vision / HDR10+" }, { cle: "RAM", valeur: "2 Go" }], featured: true },
  { nom: "Box Watch ONN Stick HD", prix: 7500, specs: [{ cle: "Résolution", valeur: "1080p Full HD" }, { cle: "OS", valeur: "Google TV" }, { cle: "Format", valeur: "Stick HDMI" }, { cle: "WiFi", valeur: "WiFi 4" }], featured: false },
  { nom: "Box Watch ONN 4K Pro", prix: 13500, specs: [{ cle: "Résolution", valeur: "4K Ultra HD" }, { cle: "OS", valeur: "Google TV" }, { cle: "RAM", valeur: "3 Go" }, { cle: "Stockage", valeur: "32 Go" }, { cle: "Dolby", valeur: "Dolby Vision & Atmos" }], featured: true },
  { nom: "Box Mecool KM2 Plus", prix: 15000, specs: [{ cle: "Résolution", valeur: "4K" }, { cle: "Processeur", valeur: "Amlogic S905X4" }, { cle: "RAM", valeur: "2 Go" }, { cle: "Stockage", valeur: "16 Go" }, { cle: "OS", valeur: "Android TV 11" }, { cle: "Netflix", valeur: "Certifié Netflix 4K" }], featured: true },
  { nom: "Box Mecool KM7 Plus", prix: 18000, specs: [{ cle: "Résolution", valeur: "4K" }, { cle: "Processeur", valeur: "Amlogic S905Y4" }, { cle: "RAM", valeur: "2 Go" }, { cle: "Stockage", valeur: "16 Go" }, { cle: "OS", valeur: "Android TV 11" }, { cle: "Google", valeur: "Certifié Google" }], featured: false },
  { nom: "Box Mecool KM2 Plus Deluxe", prix: 20000, specs: [{ cle: "Résolution", valeur: "4K HDR" }, { cle: "Processeur", valeur: "Amlogic S905X4" }, { cle: "RAM", valeur: "2 Go" }, { cle: "Stockage", valeur: "16 Go" }, { cle: "OS", valeur: "Android TV 11" }, { cle: "Certification", valeur: "Netflix 4K + Widevine L1" }], featured: true },
  { nom: "Box Rocktek GX1", prix: 11500, specs: [{ cle: "Résolution", valeur: "4K HDR" }, { cle: "Processeur", valeur: "Quad-Core ARM" }, { cle: "RAM", valeur: "2 Go" }, { cle: "OS", valeur: "Android TV" }, { cle: "WiFi", valeur: "Dual Band" }], featured: false },
  { nom: "Box Rocktek G2", prix: 14000, specs: [{ cle: "Résolution", valeur: "4K Ultra HD" }, { cle: "Processeur", valeur: "Quad-Core" }, { cle: "RAM", valeur: "4 Go" }, { cle: "Stockage", valeur: "32 Go" }, { cle: "OS", valeur: "Android TV" }], featured: false },
  { nom: "Box Rocktek GT1", prix: 16500, specs: [{ cle: "Résolution", valeur: "4K HDR10+" }, { cle: "RAM", valeur: "4 Go" }, { cle: "Stockage", valeur: "64 Go" }, { cle: "OS", valeur: "Android TV 11" }, { cle: "WiFi", valeur: "WiFi 6" }], featured: false },
  { nom: "Amazon Fire TV Stick 4K", prix: 13000, specs: [{ cle: "Résolution", valeur: "4K Ultra HD" }, { cle: "Processeur", valeur: "Octa-Core" }, { cle: "RAM", valeur: "2 Go" }, { cle: "OS", valeur: "Fire OS 7" }, { cle: "Alexa", valeur: "Télécommande Alexa incluse" }, { cle: "HDR", valeur: "HDR10, HLG, Dolby Vision" }], featured: true },
  { nom: "Amazon Fire TV Stick HD", prix: 8500, specs: [{ cle: "Résolution", valeur: "1080p Full HD" }, { cle: "Processeur", valeur: "Quad-Core 1.7 GHz" }, { cle: "RAM", valeur: "1 Go" }, { cle: "OS", valeur: "Fire OS 7" }, { cle: "Alexa", valeur: "Télécommande Alexa incluse" }], featured: false },
];

async function seed() {
  console.log("🌱 Démarrage du seed...\n");

  // Create categories
  console.log("📦 Création des catégories...");
  const categoryRefs: Record<string, string> = {};

  for (const cat of categories) {
    const doc = await client.createOrReplace({
      _id: `category-${cat.slug}`,
      _type: "category",
      nom: cat.nom,
      slug: { _type: "slug", current: cat.slug },
      icone: cat.icone,
      description: cat.description,
      ordre: cat.ordre,
    });
    categoryRefs[cat.slug] = doc._id;
    console.log(`  ✓ ${cat.icone} ${cat.nom}`);
  }

  // Create products
  console.log("\n🛍️ Création des 16 Box TV Android...");
  const boxCategoryId = categoryRefs["box-tv-android"];

  for (const product of boxTVProducts) {
    const slug = product.nom
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const doc = await client.create({
      _type: "product",
      nom: product.nom,
      slug: { _type: "slug", current: slug },
      categorie: { _type: "reference", _ref: boxCategoryId },
      prix: product.prix,
      enStock: true,
      optionAbonnement: true,
      featured: product.featured,
      ficheTechnique: product.specs.map((s, i) => ({
        _type: "spec",
        _key: `spec-${i}`,
        cle: s.cle,
        valeur: s.valeur,
      })),
      description: [
        {
          _type: "block",
          _key: "desc-1",
          style: "normal",
          children: [
            {
              _type: "span",
              _key: "span-1",
              text: `${product.nom} — Profitez d'une expérience streaming 4K exceptionnelle. Compatible avec toutes les applications de streaming populaires et les services IPTV. Interface intuitive et performance optimale pour votre salon.`,
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
    });

    console.log(`  ✓ ${product.featured ? "⭐" : " "} ${product.nom} — ${product.prix.toLocaleString("fr-DZ")} DA`);
  }

  console.log("\n✅ Seed terminé avec succès !");
  console.log(`   ${categories.length} catégories créées`);
  console.log(`   ${boxTVProducts.length} produits Box TV créés`);
  console.log("\n💡 Rendez-vous sur /studio pour vérifier et ajouter des photos.");
}

seed().catch((err) => {
  console.error("❌ Erreur lors du seed:", err);
  process.exit(1);
});
