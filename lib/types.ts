export interface Category {
  _id: string;
  nom: string;
  slug: { current: string };
  description?: string;
  icone?: string;
  ordre?: number;
  image?: { asset?: { _id: string; url: string }; alt?: string };
}

export interface FicheTechniqueItem {
  cle: string;
  valeur: string;
}

export interface Variante {
  _key: string;
  nom: string;
  couleur?: string;
  prix: number;
  prixPromo?: number;
  dateDebutPromo?: string;
  dateFinPromo?: string;
  photo?: SanityImage;
  enStock?: boolean;
}

export interface Product {
  _id: string;
  _createdAt?: string;
  nom: string;
  slug: { current: string };
  categorie: { nom: string; slug: { current: string } };
  photos: SanityImage[];
  variantes?: Variante[];
  varianteCover?: SanityImage;
  description?: PortableTextBlock[];
  ficheTechnique?: FicheTechniqueItem[];
  prix: number;
  prixAvecAbonnement?: number;
  prixPromo?: number;
  dateDebutPromo?: string;
  dateFinPromo?: string;
  enStock: boolean;
  optionAbonnement: boolean;
  featured: boolean;
  nouveaute?: boolean;
  marque?: string;
  garantie?: number;
  reference?: string;
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
  cartKey: string;
  product: Product;
  quantity: number;
  optionAbonnement?: AbonnementOption;
  variantKey?: string;
  variantNom?: string;
  variantPrix?: number;
}

export interface OrderFormData {
  prenom: string;
  nom: string;
  adresse: string;
  telephone: string;
  wilaya: string;
  message?: string;
}
