// Cloudflare Pages Function — GET /api/avis?slug=... | POST /api/avis

function corsHeaders(origin) {
  const allowList = ["https://techxpressdz.com", "https://www.techxpressdz.com"];
  let allow = "null";
  if (origin && (allowList.includes(origin) || /\.pages\.dev$/.test(new URL(origin).hostname))) {
    allow = origin;
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

const trim = (v, max) => String(v ?? "").trim().slice(0, max);

async function uploadPhoto(supabaseUrl, serviceKey, base64, mimeType, filename) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const res = await fetch(`${supabaseUrl}/storage/v1/object/avis-photos/${filename}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": mimeType,
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!res.ok) return null;
  return `${supabaseUrl}/storage/v1/object/public/avis-photos/${filename}`;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") || "";
  const origin = request.headers.get("Origin") || "";
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey || !slug) {
    return new Response(JSON.stringify([]), { headers });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/avis?product_slug=eq.${encodeURIComponent(slug)}&approuve=eq.true&order=created_at.desc&limit=50`,
    { headers: { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } }
  );

  const data = await res.json().catch(() => []);
  return new Response(JSON.stringify(Array.isArray(data) ? data : []), { headers });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "";
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };

  try {
    const data = await request.json();

    const slug = trim(data.slug, 200);
    const auteur = trim(data.auteur, 80);
    const texte = trim(data.texte, 2000);
    const note = Math.round(Number(data.note));
    const rawPhotos = Array.isArray(data.photos) ? data.photos.slice(0, 3) : [];

    if (!slug || !auteur || note < 1 || note > 5) {
      return new Response(JSON.stringify({ error: "Champs invalides" }), { status: 400, headers });
    }

    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Config serveur" }), { status: 500, headers });
    }

    const photoUrls = [];
    for (const photo of rawPhotos) {
      if (!photo?.data || !photo?.type || !photo.type.startsWith("image/")) continue;
      if (photo.data.length > 1_400_000) continue; // ~1 MB limit
      const ext = photo.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const filename = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const photoUrl = await uploadPhoto(supabaseUrl, serviceKey, photo.data, photo.type, filename);
      if (photoUrl) photoUrls.push(photoUrl);
    }

    const payload = {
      product_slug: slug,
      auteur,
      note,
      texte: texte || null,
      photos: photoUrls.length > 0 ? photoUrls : null,
      approuve: true,
    };

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/avis`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      return new Response(JSON.stringify({ error: "Erreur DB", detail: err }), { status: 502, headers });
    }

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur serveur", detail: String(err?.message || err) }), { status: 500, headers });
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, { headers: corsHeaders(origin) });
}
