export interface Category {
  _id: string;
  nom: string;
  slug: { current: string };
  description?: string;
  icone?: string;
  ordre?: number;
}

export interface FicheTechniqueItem {
  cle: string;
  valeur: string;
}

export interface Product {
  _id: string;
  nom: string;
  slug: { current: string };
  categorie: { nom: string; slug: { current: string } };
  photos: SanityImage[];
  description?: PortableTextBlock[];
  ficheTechnique?: FicheTechniqueItem[];
  prix: number;
  enStock: boolean;
  optionAbonnement: boolean;
  featured: boolean;
}

export interface SanityImage {
  _key?: string;
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
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
