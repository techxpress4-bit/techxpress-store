import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  if (!secret || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Token invalide" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body._type as string | undefined;
    const slug = body.slug?.current as string | undefined;
    const catSlug = body.categorie?.slug?.current as string | undefined;

    if (type === "product") {
      revalidatePath("/");
      revalidatePath("/catalogue");
      if (slug) revalidatePath(`/produit/${slug}`);
      if (catSlug) revalidatePath(`/catalogue/${catSlug}`);
      else revalidatePath("/catalogue/[categorie]", "page");
    } else if (type === "category") {
      revalidatePath("/");
      revalidatePath("/catalogue");
      if (slug) revalidatePath(`/catalogue/${slug}`);
    } else if (type === "settings") {
      revalidatePath("/", "layout");
    } else {
      revalidatePath("/", "layout");
    }

    return NextResponse.json({ revalidated: true, type, slug, time: Date.now() });
  } catch {
    return NextResponse.json({ message: "Erreur revalidation" }, { status: 500 });
  }
}
