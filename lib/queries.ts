export const allCategoriesQuery = `
  *[_type == "category"] | order(ordre asc) {
    _id, nom, slug, icone, description, ordre
  }
`;

export const featuredProductsQuery = `
  *[_type == "product" && featured == true] | order(_createdAt desc) [0...16] {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    photos,
    prix, enStock, optionAbonnement, nouveaute
  }
`;

export const allProductsQuery = `
  *[_type == "product"] | order(_createdAt desc) {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    photos,
    prix, enStock, optionAbonnement, featured, nouveaute
  }
`;

export const productsByCategoryQuery = `
  *[_type == "product" && categorie->slug.current == $categorie] | order(_createdAt desc) {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    photos,
    prix, enStock, optionAbonnement, nouveaute
  }
`;

export const productBySlugQuery = `
  *[_type == "product" && slug.current == $slug][0] {
    _id, nom, slug,
    categorie->{ nom, slug },
    photos,
    description,
    ficheTechnique,
    prix, enStock, optionAbonnement
  }
`;

export const categoryBySlugQuery = `
  *[_type == "category" && slug.current == $slug][0] {
    _id, nom, slug, description, icone
  }
`;
