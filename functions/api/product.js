export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const slug = searchParams.get("slug");

  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return new Response(JSON.stringify(null), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const projectId = context.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "gdccl23z";
  const dataset = context.env.NEXT_PUBLIC_SANITY_DATASET || "production";

  const query = `*[_type == "product" && slug.current == $slug][0] {
    _id, nom, slug,
    "categorie": categorie->{ nom, slug },
    photos,
    description,
    ficheTechnique,
    prix, prixPromo, dateDebutPromo, dateFinPromo, prixAvecAbonnement, enStock, optionAbonnement,
    marque, garantie, reference
  }`;

  const url = new URL(
    `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}`
  );
  url.searchParams.set("query", query);
  url.searchParams.set("$slug", JSON.stringify(slug));

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cf: { cacheEverything: false },
    });
    if (!res.ok) throw new Error("Sanity error");
    const { result } = await res.json();

    return new Response(JSON.stringify(result ?? null), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(JSON.stringify(null), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
