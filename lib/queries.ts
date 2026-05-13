const publicFilter = `(statut == "publie" || !defined(statut))`;

export const allCategoriesQuery = `
  *[_type == "category"] | order(ordre asc) {
    _id, nom, slug, icone, description, ordre,
    image { asset, hotspot, alt }
  }
`;

export const featuredProductsQuery = `
  *[_type == "product" && featured == true && ${publicFilter}] | order(coalesce(ordre, 999999) asc, _createdAt desc) [0...16] {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    photos,
    prix, prixPromo, dateFinPromo, enStock, optionAbonnement, nouveaute
  }
`;

export const allProductsQuery = `
  *[_type == "product" && ${publicFilter}] | order(coalesce(ordre, 999999) asc, _createdAt desc) {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    photos,
    prix, prixPromo, dateFinPromo, enStock, optionAbonnement, featured, nouveaute
  }
`;

export const productsByCategoryQuery = `
  *[_type == "product" && categorie->slug.current == $categorie && ${publicFilter}] | order(coalesce(ordre, 999999) asc, _createdAt desc) {
    _id, _createdAt, nom, slug,
    categorie->{ nom, slug },
    photos,
    prix, prixPromo, dateFinPromo, enStock, optionAbonnement, nouveaute
  }
`;

export const productBySlugQuery = `
  *[_type == "product" && slug.current == $slug && ${publicFilter}][0] {
    _id, nom, slug,
    categorie->{ nom, slug },
    photos,
    description,
    ficheTechnique,
    prix, prixPromo, dateFinPromo, prixAvecAbonnement, enStock, optionAbonnement,
    marque, metaTitre, metaDescription
  }
`;

export const categoryBySlugQuery = `
  *[_type == "category" && slug.current == $slug][0] {
    _id, nom, slug, description, icone,
    image { asset, hotspot, alt }
  }
`;

export const settingsQuery = `
  *[_type == "settings"][0] {
    nomSite, telephone, adresseEmail,
    banniere { active, texte, lien },
    fraisLivraison, mentionCOD,
    reseauxSociaux { facebook, instagram, tiktok }
  }
`;
