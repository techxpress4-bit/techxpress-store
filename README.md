# TechXpressDZ — Boutique en ligne

Boutique e-commerce premium pour produits électroniques en Algérie.

**Stack :** Next.js 15 · Sanity CMS · Supabase Auth · Cloudflare Workers · Resend

---

## Démarrage rapide

### 1. Installer les dépendances

```bash
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

| Variable | Description | Où l'obtenir |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | supabase.com/dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | supabase.com/dashboard → API |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ID du projet Sanity | sanity.io/manage |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset Sanity | `production` |
| `SANITY_API_TOKEN` | Token lecture Sanity | Sanity → API → Tokens (Viewer) |
| `SANITY_WRITE_TOKEN` | Token écriture Sanity | Sanity → API → Tokens (Editor) |
| `SANITY_REVALIDATE_SECRET` | Secret webhook revalidation | Chaîne aléatoire longue |
| `RESEND_API_KEY` | Clé API envoi emails | resend.com |
| `RESEND_TO_EMAIL` | Email réception commandes | Votre email |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp | Format : `213XXXXXXXXX` |
| `NEXT_PUBLIC_SITE_URL` | URL de production | `https://techxpressdz.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 | analytics.google.com |

### 3. Lancer en développement

```bash
npm run dev
# → http://localhost:3000
# → http://localhost:3000/studio (Sanity Studio)
```

---

## Déploiement sur Cloudflare Workers

```bash
# 1. Build pour Cloudflare
npm run build:cloudflare

# 2. Déployer
npm run deploy
```

> ⚠️ **Important** : toujours lancer `build:cloudflare` avant `deploy`.  
> Le simple `deploy` sans build redéploie les anciens assets.

### Variables d'environnement sur Cloudflare

Dans **Cloudflare Dashboard → Workers → techxpress → Settings → Variables**, ajouter toutes les variables du tableau ci-dessus (sans les préfixes `NEXT_PUBLIC_`pour les variables serveur).

---

## Webhook Sanity (mise à jour instantanée)

Le site se met à jour **en temps réel** dès qu'une publication est faite dans Sanity grâce à un webhook.

**Configuration dans Sanity** (sanity.io/manage → API → Webhooks) :

| Champ | Valeur |
|---|---|
| URL | `https://techxpressdz.com/api/revalidate?secret=VOTRE_SECRET` |
| HTTP Method | POST |
| Trigger on | Create · Update · Delete |
| Header Name | `Content-Type` |
| Header Value | `application/json` |

---

## Structure du projet

```
boutique-store/
├── app/
│   ├── page.tsx                  # Accueil
│   ├── catalogue/                # Catalogue + filtres catégorie
│   ├── produit/[slug]/           # Fiche produit + SEO
│   ├── panier/                   # Panier
│   ├── commander/                # Formulaire commande
│   ├── confirmation/             # Page confirmation
│   ├── contact/                  # Formulaire contact
│   ├── login/                    # Connexion / Inscription
│   ├── account/                  # Espace compte utilisateur
│   ├── mes-commandes/            # Historique commandes
│   ├── studio/                   # Sanity Studio embarqué
│   ├── auth/callback/            # Callback OAuth (Google)
│   ├── sitemap.xml               # Sitemap dynamique
│   ├── robots.txt                # Robots
│   └── api/
│       ├── commande/             # Traitement commandes + stock
│       └── revalidate/           # Webhook revalidation Sanity
├── components/
│   ├── Navbar.tsx                # Barre de navigation + dropdown user
│   ├── Footer.tsx                # Pied de page (données Sanity)
│   ├── Banniere.tsx              # Bandeau annonce (données Sanity)
│   ├── ProductCard.tsx           # Carte produit
│   ├── ProductCarousel.tsx       # Carousel Best Sellers
│   ├── CategoryCarousel.tsx      # Carousel catégories
│   ├── CartModal.tsx             # Modal panier
│   ├── WhatsAppButton.tsx        # Bouton flottant WhatsApp
│   ├── CookieBanner.tsx          # Bannière RGPD
│   └── Analytics.tsx             # Tracking GA4
├── context/CartContext.tsx        # État panier (localStorage)
├── lib/
│   ├── sanity.ts                 # Client Sanity (lecture + écriture)
│   ├── queries.ts                # Requêtes GROQ
│   ├── types.ts                  # Types TypeScript + helpers prix
│   └── wilayas.ts                # 58 wilayas d'Algérie
├── sanity/
│   └── schemas/                  # Schémas : product, category, settings
├── sanity.config.ts              # Configuration Sanity Studio
├── wrangler.toml                 # Configuration Cloudflare Workers
└── open-next.config.ts           # Adaptateur OpenNext Cloudflare
```

---

## Fonctionnalités

### Catalogue & Produits
- Filtrage par catégorie, tri par ordre personnalisable
- Prix promotionnel avec date d'expiration automatique
- Option Box seule / Box + Abonnement TV
- Badge "Nouveau", badge "Promo"
- Fiche technique structurée
- SEO : `metaTitre`, `metaDescription`, JSON-LD Product schema

### Compte utilisateur
- Connexion email/mot de passe + Google OAuth
- Réinitialisation de mot de passe par email
- Modification du profil (prénom, nom, téléphone)
- Historique des commandes
- Menu déroulant au survol du nom dans la navbar

### Commandes
- Formulaire livraison (58 wilayas)
- Paiement à la livraison uniquement (COD)
- Email automatique via Resend
- Décrémentation automatique du stock dans Sanity
- Sauvegarde en base Supabase

### Administration (Sanity Studio — `/studio`)
- Singleton "Paramètres" : bannière, réseaux sociaux, téléphone, email
- Vue catégorie → produits associés
- Filtre "Sans photos" pour détecter les produits incomplets
- Validation unicité slug en temps réel
- Mise à jour instantanée du site via webhook

---

## Paiement

**Aucun paiement en ligne** — processus COD :
1. Client passe commande en ligne
2. Email automatique reçu
3. L'équipe TechXpress appelle sous 24h
4. Livraison + paiement à la réception

---

## Analytics GA4

| Événement | Déclencheur |
|---|---|
| `page_view` | Chaque changement de page |
| `add_to_cart` | Clic "Ajouter au panier" |
| `begin_checkout` | Arrivée sur /commander |
| `purchase` | Commande validée |
| `whatsapp_click` | Clic bouton WhatsApp |

> GA4 ne se charge que si l'utilisateur **accepte** les cookies.
