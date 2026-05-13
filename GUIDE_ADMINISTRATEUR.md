# Guide d'utilisation — Administrateur TechXpressDZ

Ce guide est destiné à la personne qui gère le catalogue et les paramètres du site, **sans connaissance en code**.

---

## Accéder au Studio

Le Studio est l'interface d'administration du site.

**Adresse :** `https://techxpressdz.com/studio`

Connectez-vous avec votre compte Sanity (sanity.io). Une fois connecté, vous verrez le panneau de gauche avec toutes les sections.

---

## Ajouter un produit

**1.** Dans le panneau de gauche, cliquez sur **Produits**

**2.** Cliquez sur le bouton **+ Nouveau document** (en haut à droite)

**3.** Remplissez les champs dans l'ordre :

### Onglet "Détails"
- **Nom du produit** — le nom tel qu'il apparaîtra sur le site
- **Slug (URL)** — cliquez sur "Generate" (se remplit automatiquement depuis le nom)
- **Catégorie** — choisissez dans la liste
- **Marque / Fabricant** — ex: Samsung, Xiaomi (optionnel)
- **Statut de publication** — choisissez :
  - ✅ **Publié** → visible sur le site
  - 📝 **Brouillon** → non visible (pour préparer à l'avance)
  - 🗃️ **Archivé** → retiré du catalogue

### Onglet "Stock & Prix"
- **Prix (DA)** — prix normal en dinars algériens
- **Prix promotionnel (DA)** — laisser vide si pas de promo. Si renseigné, l'ancien prix sera barré
- **Date de fin de promo** — la promo s'arrête automatiquement à cette date
- **En stock** — coché = "En stock", décoché = "Rupture de stock"
- **Quantité en stock** — usage interne, non affiché sur le site

### Onglet "Médias"
- Cliquez sur **+ Ajouter un élément**
- Cliquez sur **Upload** pour choisir une image depuis votre ordinateur
- Ajoutez plusieurs images si disponibles (la première sera l'image principale)
- Pour chaque image, renseignez le **texte alternatif** (description de l'image pour le référencement Google)

### Onglet "Contenu"
- **Description** — texte de présentation du produit (gras, listes, liens possibles)
- **Fiche technique** — tableau de caractéristiques. Cliquez "+ Ajouter" et renseignez :
  - Caractéristique : ex. `Système`
  - Valeur : ex. `Android 12`

### Onglet "Paramètres"
- **⭐ Produit vedette** — cochez pour afficher ce produit dans "Best Sellers" sur la page d'accueil
- **🆕 Badge "Nouveau"** — cochez pour afficher le badge vert "Nouveau"
- **📺 Option abonnement TV** — cochez pour les Box TV (affiche le choix Box seule / Box + Abonnement)
- **Ordre d'affichage** — chiffre pour contrôler l'ordre dans le catalogue (1 = premier, 2 = deuxième, etc.). Laisser vide pour l'ordre par date

### Onglet "SEO" (optionnel)
- **Titre SEO** — titre personnalisé pour Google (max 60 caractères). Si vide, utilise le nom du produit
- **Meta description** — description pour Google (max 155 caractères)

**4.** Cliquez sur **Publier** (bouton vert en haut à droite)

> ✅ Le site se met à jour automatiquement en quelques secondes après publication.

---

## Modifier un produit existant

**1.** Cliquez sur **Produits** dans le panneau de gauche

**2.** Retrouvez votre produit dans la liste (vous pouvez filtrer par statut ou utiliser la barre de recherche en haut)

**3.** Cliquez sur le produit pour l'ouvrir

**4.** Modifiez les champs souhaités

**5.** Cliquez sur **Publier**

### Mettre un produit en rupture de stock
- Ouvrez le produit → onglet **Stock & Prix**
- Décochez **En stock**
- Publiez → la fiche affichera "Rupture de stock" automatiquement

### Supprimer un produit
- Ouvrez le produit
- Cliquez sur les **3 points** (•••) en haut à droite
- Choisissez **Delete**

> 💡 Préférez **Archiver** (statut "Archivé") plutôt que supprimer, pour garder un historique.

---

## Produits sans photos

Pour voir rapidement les produits qui n'ont pas encore de photo :

**1.** Cliquez sur **Produits**

**2.** En haut, cliquez sur le menu **Filter** → choisissez **📷 Sans photos**

Vous verrez la liste des produits incomplets à traiter en priorité.

---

## Gérer les catégories

**1.** Cliquez sur **Catégories** dans le panneau de gauche

**2.** Cliquez sur une catégorie pour la modifier

**3.** Vous pouvez modifier :
- **Nom** — affiché sur le site
- **Image** — photo de fond de la carte catégorie
- **Icône** — emoji affiché sur la carte (laisser vide pour n'afficher que l'image)
- **Description** — texte d'introduction de la page catégorie

### Voir les produits d'une catégorie

Cliquez sur une catégorie → cliquez sur **🛍️ Produits de cette catégorie** pour voir et modifier les produits directement.

---

## Créer une promotion

**1.** Ouvrez le produit à promouvoir

**2.** Onglet **Stock & Prix** :
- Renseignez le **Prix promotionnel** (doit être inférieur au prix normal)
- Renseignez la **Date de fin de promo** (optionnel — la promo s'arrête automatiquement)

**3.** Publiez

Le site affichera automatiquement :
- Le badge **PROMO** rouge sur la carte produit
- L'ancien prix barré
- Le nouveau prix en violet
- La date d'expiration si renseignée

Pour **terminer une promo** : effacez le champ "Prix promotionnel" et publiez.

---

## Bannière d'annonce

La bannière est la bande violette qui peut apparaître tout en haut du site.

**1.** Dans le panneau de gauche, cliquez sur **⚙️ Paramètres du site**

**2.** Section **Bannière d'annonce** :
- **Activer la bannière** — cochez/décochez pour afficher/masquer
- **Texte** — ex: `🚀 Livraison gratuite ce week-end !`
- **Lien (optionnel)** — URL vers laquelle la bannière renvoie au clic

**3.** Publiez

---

## Paramètres du site

Accessible via **⚙️ Paramètres du site** dans le panneau de gauche.

| Champ | Description |
|---|---|
| Nom du site | Affiché dans les emails et métadonnées |
| Téléphone | Numéro WhatsApp (format : 213XXXXXXXXX) |
| Email | Email de contact affiché sur le site |
| Frais de livraison | Montant en DA (informatif) |
| Instagram | Lien complet vers votre page Instagram |
| TikTok | Lien complet vers votre page TikTok |

---

## Voir les commandes reçues

Les commandes sont gérées dans **Supabase** (base de données du site).

**1.** Rendez-vous sur `https://supabase.com/dashboard`

**2.** Connectez-vous et ouvrez votre projet

**3.** Dans le menu de gauche, cliquez sur **Table Editor**

**4.** Cliquez sur la table **commandes**

Vous verrez toutes les commandes avec :
- Nom, prénom, téléphone, wilaya
- Produits commandés et quantités
- Total en DA
- Statut (en attente, confirmée, expédiée, livrée, annulée)
- Date de la commande

### Changer le statut d'une commande

**1.** Cliquez sur la ligne de la commande

**2.** Cliquez sur le champ **statut**

**3.** Choisissez le nouveau statut parmi :
- `en_attente` — commande reçue, pas encore traitée
- `confirmée` — vous avez contacté le client
- `expédiée` — colis envoyé
- `livrée` — commande reçue par le client
- `annulée` — commande annulée

**4.** Cliquez **Save** en bas

> Le client peut voir le statut de ses commandes depuis son compte sur le site.

---

## Conseils pratiques

**Pour un produit qui se vend bien** → cochez "Produit vedette" pour l'afficher en page d'accueil dans "Best Sellers"

**Pour contrôler l'ordre d'affichage** → utilisez le champ "Ordre d'affichage" : mettez 1 pour le premier, 2 pour le deuxième, etc.

**Pour préparer une publication** → mettez le statut sur "Brouillon", finalisez tout, puis changez en "Publié" quand vous êtes prêt

**Si le site ne se met pas à jour** → attendez 60 secondes maximum (cache de sécurité). Si après 2 minutes rien ne change, vérifiez que le webhook est bien configuré dans Sanity (API → Webhooks)

**Pour les images** → privilégiez des images au format carré ou 4:3, en JPG ou WebP, de moins de 2 Mo. Sanity les optimise automatiquement.
