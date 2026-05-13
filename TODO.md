# TODO — TechXpressDZ
_Dernière mise à jour : 2026-05-13_

---

## ✅ Réalisé

### Session 1 (2026-05-12) — Scaffold initial
- [x] Next.js 15 + Sanity + Cloudflare Workers + Resend + Supabase Auth
- [x] Seed Sanity (7 catégories + 16 produits Box TV)
- [x] Navbar responsive : Login, Panier, Instagram, TikTok
- [x] WhatsApp button flottant animé
- [x] Page Login : onglets + Google OAuth
- [x] Polices Outfit + Inter, design system dark violet
- [x] ProductCard hover lift + violet glow, badges Nouveau/Promo
- [x] Page Mon Compte (/account)
- [x] Footer, fil d'Ariane, CookieBanner RGPD, Analytics GA4

### Session 2 (2026-05-13) — Fonctionnalités & UX

#### Librairie & Infrastructure
- [x] Types TypeScript étendus (marque, metaTitre, metaDescription, dateFinPromo, ordre, image catégorie)
- [x] `isPromoActive()` — vérification date expiration promo
- [x] `getItemPrice()` — prix correct selon promo active + option abonnement
- [x] `writeClient` Sanity pour mutations (décrémentation stock)
- [x] `settingsQuery` — paramètres globaux depuis Sanity
- [x] Filtre `publicFilter` (bloque brouillons/archivés sur toutes les requêtes)
- [x] Tri `coalesce(ordre, 999999)` sur toutes les listes
- [x] Cache fallback réduit 300s → 60s
- [x] Webhook `/api/revalidate` — mise à jour instantanée à la publication Sanity

#### Sanity Studio
- [x] Singleton "Paramètres" (bannière, réseaux sociaux, téléphone, email)
- [x] Validation unicité slug en temps réel
- [x] Champs `dateFinPromo`, `ordre`, warning photos manquantes
- [x] Drill-down catégorie → produits associés
- [x] Filtre "Sans photos" dans la vue Produits
- [x] visionTool uniquement en développement

#### Layout & Navigation
- [x] Bannière d'annonce pilotée par Sanity (texte + lien optionnel)
- [x] CSS variable `--banner-h` pour décalage automatique navbar
- [x] Navbar : dropdown hover sur nom utilisateur (Mon compte, Mes commandes, Se déconnecter)
- [x] Footer async : réseaux sociaux et téléphone depuis Sanity
- [x] Headers sections agrandis (text-2xl/3xl responsive)

#### Catalogue
- [x] CategoryCarousel : image Sanity, icône conditionnelle, hauteur fixe 120px
- [x] ProductCard : prix promo avec `isPromoActive()`, badge Nouveau

#### Page Produit
- [x] SEO : `metaTitre` et `metaDescription` personnalisés
- [x] JSON-LD Product schema complet (marque, prix, disponibilité, breadcrumb)
- [x] Prix promo avec date d'expiration affichée

#### Panier & Commande
- [x] Confirmation deux étapes pour "Vider le panier"
- [x] API commande : sauvegarde Supabase + décrémentation stock Sanity
- [x] `totalPrice` et affichage utilisent `getItemPrice()`

#### Compte Utilisateur
- [x] Réinitialisation mot de passe par email (Supabase)
- [x] Profil modifiable (prénom, nom, téléphone)
- [x] Historique commandes avec prix corrects
- [x] Contact : liens sociaux depuis Sanity

#### SEO & Routing
- [x] `sitemap.xml` dynamique
- [x] `robots.txt`
- [x] Page 404 personnalisée

---

## 🔲 Reste à faire

### 🔴 Priorité haute
- [ ] **Pagination catalogue** — indispensable à partir de ~200 produits pour les performances
- [ ] **Actions utilisateur sur mobile** — le dropdown navbar n'est visible qu'en desktop, ajouter Mes commandes / Se déconnecter dans le menu hamburger
- [ ] **Statut commande (admin)** — permettre à l'équipe de changer le statut d'une commande (en attente → confirmée → expédiée → livrée) sans accéder à Supabase directement

### 🟡 Priorité moyenne
- [ ] **Recherche produits** — barre de recherche dans le catalogue (GROQ `match`)
- [ ] **Zoom image produit** — clic sur photo → lightbox plein écran
- [ ] **Produits similaires** — section "Vous aimerez aussi" en bas de fiche (même catégorie)
- [ ] **Galerie multi-images** — carousel swipeable sur la fiche produit

### 🟢 Priorité basse
- [ ] **Tableau de bord commandes** — page `/admin/commandes` intégrée au site
- [ ] **Export CSV commandes** — pour la comptabilité
- [ ] **Avis clients** — système notation / commentaires
- [ ] **Wishlist** — sauvegarder des produits favoris
- [ ] **Newsletter** — intégration Resend Audiences
- [ ] **Déploiement WSL** — le build affiche un warning Windows, builder depuis WSL pour fiabilité maximale
- [ ] **Mise à jour `compatibility_date`** dans `wrangler.toml` à chaque trimestre
