# TechXpress — To-Do List
_Dernière mise à jour : 2026-05-22_

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

## ✅ Fait depuis (2026-05-14 → 2026-05-22)
- [x] Fix mobile UX : icônes login/social dans le menu, cart modal hors-écran
- [x] 23 correctifs sécurité : vérification prix côté serveur (Sanity), validation Zod, CSRF, CSP headers, HSTS, open redirect auth, XSS JSON-LD, colonnes Supabase limitées, GA consent-gated
- [x] Signature HMAC webhook Sanity (`@sanity/webhook`) — nécessite `SANITY_WEBHOOK_SECRET`
- [x] Déploiement Cloudflare Pages (static export) — projet `techxpress-store`
- [x] Pages Function `/api/commande` (remplace route handler Next.js)
- [x] Page de confirmation de commande (`/confirmation`)
- [x] Galerie d'images multiples sur fiche produit (`ProductImageGallery`)
- [x] Pages légales : CGV, Mentions légales, Politique de retour, Confidentialité
- [x] Strip réassurance homepage (mobile + desktop)
- [x] ProductCard : toujours afficher la 1ère photo du Studio (`photos[0..0]` dans les requêtes GROQ)

## 🔲 Reste à faire

### Auth & Compte
- [ ] SQL Supabase : créer table `profiles` + trigger (script dans le chat)
- [ ] Mot de passe oublié (Supabase reset password flow)
- [ ] Page /account : historique commandes, infos perso éditables, gestion newsletter

### Catalogue & Produits
- [ ] Barre de recherche produits (filtre client-side ou Sanity GROQ)
- [ ] Filtre par prix / disponibilité dans le catalogue
- [ ] Vérifier responsive page panier sur mobile

### Conversion
- [ ] Section avis clients / social proof (homepage + fiches produit)
- [ ] Upsell / produits similaires en bas de fiche produit

### Email (Resend)
- [ ] Configurer `RESEND_API_KEY` + `RESEND_FROM_EMAIL` dans Cloudflare env
- [ ] Email de confirmation commande client
- [ ] Email de notification commande admin

### Déploiement & Env
- [ ] Configurer domaine custom sur Cloudflare Pages
- [ ] Ajouter `SANITY_WEBHOOK_SECRET` dans Cloudflare Worker env vars
- [ ] Ajouter `NEXT_PUBLIC_SITE_URL` dans Cloudflare env (CSRF check)
- [ ] Google OAuth : ajouter l'URL de prod dans Google Cloud Console redirect URIs
- [ ] Activer Google Provider dans Supabase avec vraies clés Google Cloud
- [ ] Supabase RLS : activer les policies sur tables `commandes` et `profiles`

### Analytics
- [ ] Renseigner `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- [ ] Renseigner `NEXT_PUBLIC_GTM_ID`

### SEO
- [ ] Metadata dynamique sur pages produit (titre, description, og:image)
- [ ] sitemap.xml dynamique
- [ ] robots.txt
