# TechXpress — To-Do List
_Dernière mise à jour : 2026-05-12_

## ✅ Fait dans cette session (2026-05-12)
- [x] Scaffold complet Next.js 15 + Sanity + Cloudflare + Resend
- [x] Seed Sanity (7 catégories + 16 produits Box TV)
- [x] Navbar : Login, Mon Panier, Instagram, TikTok, responsive
- [x] WhatsApp button flottant animé
- [x] Page Login avec onglets Login / Créer un compte + Google OAuth
- [x] Intégration Supabase Auth (email/password + Google)
- [x] Badge panier redesigné (absolu, propre)
- [x] Fix chiffres (font-variant-numeric: lining-nums tabular-nums)
- [x] Polices Outfit + Inter via next/font/google
- [x] Hero features blocks agrandis
- [x] ProductCard hover lift + violet glow
- [x] Skeleton loading (Sanity fetch)
- [x] Contact page spacing cohérent
- [x] Badges Nouveau / Promo sur produits
- [x] Page Mon Compte (/account)
- [x] Footer refresh visuel
- [x] Fil d'Ariane (catalogue / produit)
- [x] CTA Commander plus visible sur fiches produit
- [x] État d'erreur si Sanity est down

## 🔲 Reste à faire

### Auth & Compte
- [ ] SQL Supabase : créer table `profiles` + trigger (script dans le chat)
- [ ] Page /account : historique commandes, infos perso éditables, gestion newsletter
- [ ] Mot de passe oublié (Supabase reset password flow)
- [ ] Protéger /account avec middleware redirect si non connecté

### Catalogue & Produits
- [ ] Barre de recherche produits (filtre client-side ou Sanity GROQ)
- [ ] Filtre par prix / disponibilité dans le catalogue
- [ ] Page produit : galerie d'images multiples
- [ ] Vérifier responsive page panier sur mobile

### Conversion
- [ ] Section avis clients / social proof (homepage + fiches produit)
- [ ] Upsell / produits similaires en bas de fiche produit
- [ ] Page de confirmation de commande après checkout

### Email (Resend)
- [ ] Configurer RESEND_API_KEY + RESEND_TO_EMAIL dans .env.local
- [ ] Email de confirmation commande client
- [ ] Email de notification commande admin

### Déploiement
- [ ] Configurer domaine custom sur Cloudflare Pages
- [ ] Variables d'env sur Cloudflare (dashboard ou wrangler.toml secrets)
- [ ] `npm run build:cloudflare` → vérifier 0 erreur
- [ ] Google OAuth : ajouter l'URL de prod dans Google Cloud Console redirect URIs
- [ ] Activer Google Provider dans Supabase avec vraies clés Google Cloud

### Analytics
- [ ] Renseigner NEXT_PUBLIC_GA_MEASUREMENT_ID
- [ ] Renseigner NEXT_PUBLIC_GTM_ID

### SEO
- [ ] Metadata dynamique sur pages produit (titre, description, og:image)
- [ ] sitemap.xml dynamique
- [ ] robots.txt
