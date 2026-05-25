export const allCategoriesQuery = `
  *[_type == "category"] | order(ordre asc) {
    _id, nom, slug, icone, description, ordre,
    image { asset->{ _id, url }, alt }
  }
`;

export const featuredProductsQuery = `
  *[_type == "product" && featured == true] | order(_createdAt desc) [0...8] {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    "photos": photos[0..0],
    "varianteCover": variantes[0].photo,
    "variantes": variantes[]{_key, nom, couleur},
    prix, prixPromo, dateFinPromo, enStock, optionAbonnement, nouveaute
  }
`;

export const bestSellersQuery = `
  *[_type == "bestSellers"][0] {
    "produits": produits[0..7]->{
      _id, _createdAt, nom, slug,
      categorie->{ nom, slug },
      "photos": photos[0..0],
      "varianteCover": variantes[0].photo,
      "variantes": variantes[]{_key, nom, couleur},
      prix, prixPromo, dateFinPromo, enStock, optionAbonnement, nouveaute
    }
  }
`;

export const allProductsQuery = `
  *[_type == "product"] | order(_createdAt desc) {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    "photos": photos[0..0],
    "varianteCover": variantes[0].photo,
    "variantes": variantes[]{_key, nom, couleur},
    prix, prixPromo, dateFinPromo, enStock, optionAbonnement, featured, nouveaute
  }
`;

export const productsByCategoryQuery = `
  *[_type == "product" && categorie->slug.current == $categorie] | order(_createdAt desc) {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    "photos": photos[0..0],
    "varianteCover": variantes[0].photo,
    "variantes": variantes[]{_key, nom, couleur},
    prix, prixPromo, dateFinPromo, enStock, optionAbonnement, nouveaute
  }
`;

export const productBySlugQuery = `
  *[_type == "product" && slug.current == $slug][0] {
    _id, nom, slug,
    categorie->{ nom, slug },
    photos,
    "variantes": variantes[]{_key, nom, couleur, prix, prixPromo, dateFinPromo, photo, enStock},
    description,
    ficheTechnique,
    prix, prixPromo, dateFinPromo, prixAvecAbonnement, enStock, optionAbonnement,
    marque, garantie, reference
  }
`;

export const categoryBySlugQuery = `
  *[_type == "category" && slug.current == $slug][0] {
    _id, nom, slug, description, icone
  }
`;
