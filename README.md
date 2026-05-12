# Tech Xpress — Boutique en ligne

Boutique e-commerce premium pour produits électroniques en Algérie.
Stack : **Next.js 15** + **Sanity CMS** + **Cloudflare Pages** + **Resend**

---

## Configuration initiale

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Remplir `.env.local` avec vos vraies valeurs :

| Variable | Où l'obtenir |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | [sanity.io/manage](https://sanity.io/manage) |
| `SANITY_API_TOKEN` | Sanity > API > Tokens (permission **Editor**) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) |
| `RESEND_TO_EMAIL` | Votre email pour recevoir les commandes |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Format : `213XXXXXXXXX` (sans +) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager |

### 3. Créer un projet Sanity

```bash
npx sanity@latest init --project techxpress --dataset production --template clean
```

Ou créez-le sur [sanity.io/manage](https://sanity.io/manage) et copiez le Project ID.

### 4. Peupler la base de données (16 Box TV)

```bash
npm run seed
```

Ce script crée automatiquement :
- 7 catégories (Box TV, Abonnements, Accessoires, Routeurs, Câbles, Supports, Paraboles)
- 16 produits Box TV Android avec prix et fiches techniques

### 5. Ajouter les photos via Sanity Studio

```bash
npm run dev
# Ouvrir http://localhost:3000/studio
```

Dans le Studio : chaque produit > champ Photos > Upload.

---

## Démarrage en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

**Studio Sanity** : [http://localhost:3000/studio](http://localhost:3000/studio)

---

## Déploiement sur Cloudflare Pages

### Option 1 : Via GitHub (recommandé)

1. Pousser le code sur GitHub
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → **Create a project** → **Connect to Git**
3. Sélectionner votre dépôt GitHub
4. Configurer le build :

| Paramètre | Valeur |
|---|---|
| **Framework preset** | None (Custom) |
| **Build command** | `npx @opennextjs/cloudflare` |
| **Build output directory** | `.open-next/assets` |
| **Node.js version** | `20.x` |

5. Ajouter toutes les variables d'environnement dans :
   **Settings → Environment variables**

### Option 2 : Deploy manuel

```bash
# Build pour Cloudflare
npx @opennextjs/cloudflare

# Déployer
npx wrangler pages deploy
```

### Variables d'environnement sur Cloudflare

Dans **Pages → votre projet → Settings → Environment variables**, ajouter :

```
NEXT_PUBLIC_SANITY_PROJECT_ID    = votre-id
NEXT_PUBLIC_SANITY_DATASET       = production
SANITY_API_TOKEN                 = votre-token
RESEND_API_KEY                   = re_xxx
RESEND_TO_EMAIL                  = votre@email.com
NEXT_PUBLIC_WHATSAPP_NUMBER      = 213XXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID    = G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID               = GTM-XXXXXXX
```

---

## Gestion du catalogue

Tout le catalogue se gère via **Sanity Studio** à `/studio` :

### Ajouter un produit
1. Ouvrir `/studio`
2. **Produits** → **+ Nouveau produit**
3. Remplir : Nom, Catégorie, Photos, Prix, Stock
4. Publier ✅

### Champs importants

| Champ | Description |
|---|---|
| **En stock** | Affiche "En stock" ou "Rupture de stock" |
| **Option abonnement** | Pour Box TV : affiche le choix Box seule / Box + Abonnement |
| **Produit vedette** | Apparaît sur la page d'accueil |
| **Fiche technique** | Tableau de spécifications (ex: RAM: 2 Go) |

---

## Structure du projet

```
boutique-store/
├── app/                    # Pages Next.js 15 App Router
│   ├── page.tsx            # Accueil
│   ├── catalogue/          # Catalogue + filtres par catégorie
│   ├── produit/[slug]/     # Fiche produit détaillée
│   ├── panier/             # Panier d'achat
│   ├── commander/          # Formulaire de commande
│   ├── confirmation/       # Page de confirmation
│   ├── contact/            # Page contact
│   ├── studio/             # Sanity Studio embarqué
│   └── api/commande/       # API route envoi email (Resend)
├── components/             # Composants réutilisables
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── CartModal.tsx       # Popup "Continuer / Voir le panier"
│   ├── WhatsAppButton.tsx  # Bouton flottant WhatsApp
│   ├── CookieBanner.tsx    # Bannière RGPD
│   └── Analytics.tsx       # Tracking GA4
├── context/CartContext.tsx # État panier (localStorage)
├── lib/
│   ├── sanity.ts           # Client Sanity + urlFor
│   ├── queries.ts          # Requêtes GROQ
│   ├── types.ts            # Types TypeScript
│   └── wilayas.ts          # 58 wilayas d'Algérie
├── sanity/
│   ├── schemas/            # Schémas Sanity (product, category)
│   └── seed/seedProducts.ts # Script de seed (16 Box TV)
├── public/logo.png         # À déposer manuellement
├── sanity.config.ts        # Configuration Sanity Studio
├── wrangler.toml           # Configuration Cloudflare Pages
├── open-next.config.ts     # Adaptateur OpenNext Cloudflare
└── .env.local              # Variables d'environnement (ne pas commiter)
```

---

## Logo

Déposer le fichier logo à : `public/logo.png`

Le monogramme **TX** (vert algérien + rouge) est utilisé comme fallback automatique si `logo.png` n'est pas présent.

---

## Analytics GA4 — Événements trackés

| Événement | Déclencheur |
|---|---|
| `page_view` | Chaque changement de page |
| `product_click` | Clic sur une fiche produit |
| `add_to_cart` | Clic "Ajouter au panier" |
| `begin_checkout` | Arrivée sur /commander |
| `purchase` | Formulaire de commande envoyé |
| `whatsapp_click` | Clic bouton WhatsApp |

> GA4 ne se charge que si l'utilisateur **accepte** les cookies.

---

## Paiement

**Aucun paiement en ligne** — Le site est une vitrine e-commerce.
Le processus :
1. Client commande en ligne
2. Reçoit confirmation automatique
3. L'équipe Tech Xpress appelle sous 24h
4. Livraison + paiement à la réception (COD)

---

## Commandes reçues par email

L'email de commande (via Resend) inclut :
- Nom, prénom, téléphone, wilaya, adresse
- Liste des produits + options abonnement + quantités
- Total en DA
- Message optionnel

---

## Support

Pour toute question technique, ouvrir une issue ou contacter via WhatsApp.
