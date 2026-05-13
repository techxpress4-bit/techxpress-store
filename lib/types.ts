export interface Category {
  _id: string;
  nom: string;
  slug: { current: string };
  description?: string;
  icone?: string;
  ordre?: number;
  image?: SanityImage;
}

export interface FicheTechniqueItem {
  cle: string;
  valeur: string;
}

export interface Product {
  _id: string;
  _createdAt?: string;
  nom: string;
  slug: { current: string };
  categorie: { nom: string; slug: { current: string } };
  photos: SanityImage[];
  description?: PortableTextBlock[];
  ficheTechnique?: FicheTechniqueItem[];
  prix: number;
  prixPromo?: number;
  prixAvecAbonnement?: number;
  enStock: boolean;
  optionAbonnement: boolean;
  featured: boolean;
  nouveaute?: boolean;
  marque?: string;
  metaTitre?: string;
  metaDescription?: string;
  ordre?: number;
  dateFinPromo?: string;
}

export interface SanityImage {
  _key?: string;
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
}

export type PortableTextBlock = {
  _type: string;
  _key: string;
  [key: string]: unknown;
};

export type AbonnementOption = "box-seule" | "box-abonnement";

export interface CartItem {
  product: Product;
  quantity: number;
  optionAbonnement?: AbonnementOption;
}

export interface OrderFormData {
  prenom: string;
  nom: string;
  adresse: string;
  telephone: string;
  wilaya: string;
  message?: string;
}

export function isPromoActive(product: Product): boolean {
  if (!product.prixPromo) return false;
  if (!product.dateFinPromo) return true;
  const today = new Date().toISOString().split("T")[0];
  return product.dateFinPromo >= today;
}

export function getItemPrice(item: CartItem): number {
  if (item.optionAbonnement === "box-abonnement" && item.product.prixAvecAbonnement) {
    return item.product.prixAvecAbonnement;
  }
  if (isPromoActive(item.product)) return item.product.prixPromo!;
  return item.product.prix;
}

export type OrderStatus = "en_attente" | "confirmée" | "expédiée" | "livrée" | "annulée";

export interface Order {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  adresse: string;
  telephone: string;
  wilaya: string;
  message?: string;
  items: CartItem[];
  total_price: number;
  statut: OrderStatus;
}

export interface SanitySettings {
  nomSite?: string;
  telephone?: string;
  adresseEmail?: string;
  banniere?: {
    active: boolean;
    texte?: string;
    lien?: string;
  };
  fraisLivraison?: number;
  mentionCOD?: string;
  reseauxSociaux?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
}
