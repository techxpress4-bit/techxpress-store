// Cloudflare Pages Function — POST /api/commande
// Reçoit soit une commande (paiement à la livraison), soit un message de contact.

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const trim = (v, max = 500) => String(v ?? "").trim().slice(0, max);

function corsHeaders(origin) {
  const allowList = [
    "https://techxpressdz.com",
    "https://www.techxpressdz.com",
  ];
  let allow = "null";
  if (origin && (allowList.includes(origin) || /\.pages\.dev$/.test(new URL(origin).hostname))) {
    allow = origin;
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

async function sendEmail(apiKey, { from, to, subject, html, text, replyTo }) {
  const body = { from, to: [to], subject, html };
  if (text) body.text = text;
  if (replyTo) body.reply_to = replyTo;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res;
}

async function saveToSupabase(env, payload) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.warn("[commande] Supabase not configured; skipping save");
    return { ok: false, status: 0, error: "supabase_not_configured" };
  }
  const res = await fetch(`${url}/rest/v1/commandes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    console.error(`[commande] Supabase insert failed ${res.status}: ${errTxt}`);
    return { ok: false, status: res.status, error: errTxt };
  }
  return { ok: true, status: res.status };
}

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;
  const origin = request.headers.get("Origin") || "";
  const baseHeaders = { "Content-Type": "application/json", ...corsHeaders(origin) };

  try {
    const data = await request.json();

    const apiKey = env.RESEND_API_KEY;
    const toEmail = env.RESEND_TO_EMAIL;
    const fromEmail = env.RESEND_FROM_EMAIL || "Tech Xpress <onboarding@resend.dev>";

    if (!apiKey || !toEmail) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: baseHeaders,
      });
    }

    let adminSubject, adminHtml, customerSubject, customerHtml, customerEmail;

    if (data.type === "contact") {
      const nom = trim(data.nom, 100);
      const email = trim(data.email, 150);
      const telephone = trim(data.telephone, 30);
      const message = trim(data.message, 2000);

      if (!nom || !message) {
        return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
          status: 400,
          headers: baseHeaders,
        });
      }

      adminSubject = `Nouveau message — ${escapeHtml(nom)}`;
      adminHtml = `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email) || "—"}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(telephone) || "—"}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `;

      const adminRes = await sendEmail(apiKey, { from: fromEmail, to: toEmail, subject: adminSubject, html: adminHtml });
      if (!adminRes.ok) {
        const err = await adminRes.text();
        return new Response(JSON.stringify({ error: "Échec d'envoi", detail: err }), {
          status: 502,
          headers: baseHeaders,
        });
      }

      return new Response(JSON.stringify({ success: true }), { headers: baseHeaders });
    }

    // --- Order flow ---
    const prenom = trim(data.prenom, 80);
    const nom = trim(data.nom, 80);
    const adresse = trim(data.adresse, 300);
    const codePostal = trim(data.codePostal, 20);
    const daira = trim(data.daira, 80);
    const telephone = trim(data.telephone, 30);
    const wilaya = trim(data.wilaya, 80);
    const message = trim(data.message, 1000);
    const email = trim(data.email, 150);
    const userId = typeof data.userId === "string" ? data.userId : null;
    const items = Array.isArray(data.items) ? data.items.slice(0, 50) : [];
    const shippingOption =
      data.shippingOption === "stop_desk" ? "stop_desk" : "domicile";
    const shippingFeeRaw = Number(data.shippingFee);
    const shippingFee = Number.isFinite(shippingFeeRaw) && shippingFeeRaw >= 0
      ? Math.round(shippingFeeRaw)
      : null;

    if (!prenom || !nom || !adresse || !daira || !telephone || !wilaya) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    if (shippingFee === null) {
      return new Response(JSON.stringify({ error: "Frais de livraison manquants" }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    // Adresse complète pour stockage Supabase (1 colonne) et email
    const adresseComplete = [
      adresse,
      codePostal ? `Code postal : ${codePostal}` : null,
      `Daïra : ${daira}`,
      `Wilaya : ${wilaya}`,
    ]
      .filter(Boolean)
      .join(" — ");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: baseHeaders,
      });
    }
    const phoneClean = telephone.replace(/[\s\-.()]/g, "");
    if (!/^(?:0[567]\d{8}|\+[1-9]\d{7,14})$/.test(phoneClean)) {
      return new Response(JSON.stringify({ error: "Téléphone invalide" }), {
        status: 400,
        headers: baseHeaders,
      });
    }
    if (items.length === 0) {
      return new Response(JSON.stringify({ error: "Panier vide" }), {
        status: 400,
        headers: baseHeaders,
      });
    }

    // Re-calculate total server-side
    let totalCalc = 0;
    const itemRows = items
      .map((item) => {
        const p = item?.product || {};
        const qty = Math.max(1, Math.min(99, Number(item?.quantity) || 1));
        const isAbonnement = item?.optionAbonnement === "box-abonnement";
        const variantNom = trim(item?.variantNom || "", 80);
        const variantPrix = Number(item?.variantPrix);
        const today = new Date().toISOString().split("T")[0];
        const promoActive = Number(p.prixPromo) > 0 && Number(p.prixPromo) < Number(p.prix) &&
          (!p.dateDebutPromo || p.dateDebutPromo <= today) &&
          (!p.dateFinPromo || p.dateFinPromo >= today);
        const prixBase = promoActive ? Number(p.prixPromo) : Number(p.prix) || 0;
        // Priority: variant price > abonnement price > base price
        const unit =
          variantPrix > 0
            ? variantPrix
            : isAbonnement && Number(p.prixAvecAbonnement) > 0
            ? Number(p.prixAvecAbonnement)
            : prixBase;
        const ligneTotal = unit * qty;
        totalCalc += ligneTotal;
        const label =
          (variantNom ? ` — ${variantNom}` : "") +
          (isAbonnement ? " (avec abonnement TV)" : "");
        return `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(p.nom || "—")}${escapeHtml(label)}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${qty}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${unit.toLocaleString("fr-DZ")} DA</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">${ligneTotal.toLocaleString("fr-DZ")} DA</td>
          </tr>
        `;
      })
      .join("");

    const grandTotal = totalCalc + shippingFee;

    const shippingLabel =
      shippingOption === "stop_desk" ? "Point relais (Stop Desk)" : "Livraison à domicile";

    const orderTableHtml = `
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #ddd;text-align:left;">Produit</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qté</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Prix unitaire</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right;">Total ligne</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="margin-top:14px;">Sous-total produits : <strong>${totalCalc.toLocaleString("fr-DZ")} DA</strong></p>
      <p style="margin-top:4px;">Livraison (${escapeHtml(shippingLabel)}) : <strong>${shippingFee.toLocaleString("fr-DZ")} DA</strong></p>
      <p style="margin-top:8px;font-size:16px;"><strong>Total commande : ${grandTotal.toLocaleString("fr-DZ")} DA</strong></p>
    `;

    // Admin email
    adminSubject = `Nouvelle commande — ${escapeHtml(prenom)} ${escapeHtml(nom)}`.trim();
    adminHtml = `
      <h2>Nouvelle commande</h2>
      <h3>Informations client</h3>
      <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
      <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
      <p><strong>Adresse :</strong> ${escapeHtml(adresse)}</p>
      ${codePostal ? `<p><strong>Code postal :</strong> ${escapeHtml(codePostal)}</p>` : ""}
      <p><strong>Daïra :</strong> ${escapeHtml(daira)}</p>
      <p><strong>Wilaya :</strong> ${escapeHtml(wilaya)}</p>
      <p><strong>Mode de livraison :</strong> ${escapeHtml(shippingLabel)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(phoneClean)}</p>
      <p><strong>Email client :</strong> ${escapeHtml(email)}</p>
      ${message ? `<p><strong>Note :</strong> ${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
      <h3>Produits commandés</h3>
      ${orderTableHtml}
      <p style="color:#666;font-size:12px;">Paiement à la livraison — aucune somme à encaisser en ligne.</p>
    `;

    // Customer confirmation email — light theme, Outlook-compatible table layout
    customerEmail = email;
    customerSubject = `Confirmation de votre commande TechXpress DZ`;

    const productRows = items
      .map((item) => {
        const p = item?.product || {};
        const qty = Math.max(1, Math.min(99, Number(item?.quantity) || 1));
        const isAbonnement = item?.optionAbonnement === "box-abonnement";
        const variantNom = trim(item?.variantNom || "", 80);
        const variantPrix = Number(item?.variantPrix);
        const today = new Date().toISOString().split("T")[0];
        const promoActive =
          Number(p.prixPromo) > 0 &&
          Number(p.prixPromo) < Number(p.prix) &&
          (!p.dateDebutPromo || p.dateDebutPromo <= today) &&
          (!p.dateFinPromo || p.dateFinPromo >= today);
        const prixBase = promoActive ? Number(p.prixPromo) : Number(p.prix) || 0;
        const unit =
          variantPrix > 0
            ? variantPrix
            : isAbonnement && Number(p.prixAvecAbonnement) > 0
            ? Number(p.prixAvecAbonnement)
            : prixBase;
        const lineTotal = unit * qty;
        return `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #ececec;font-family:Helvetica,Arial,sans-serif;">
              <p style="margin:0;color:#1a1a1a;font-size:14px;font-weight:600;line-height:1.4;">${escapeHtml(p.nom || "Produit")}</p>
              ${variantNom ? `<p style="margin:2px 0 0;color:#6b3fa0;font-size:12px;font-weight:600;">${escapeHtml(variantNom)}</p>` : ""}
              <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">
                Quantité&nbsp;: ${qty}${isAbonnement ? " &middot; Avec abonnement TV" : ""}
              </p>
            </td>
            <td style="padding:14px 0;border-bottom:1px solid #ececec;text-align:right;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:14px;font-weight:600;white-space:nowrap;vertical-align:top;">
              ${lineTotal.toLocaleString("fr-DZ")} DA
            </td>
          </tr>
        `;
      })
      .join("");

    const infoRow = (label, value) =>
      value
        ? `
          <tr>
            <td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:13px;vertical-align:top;width:130px;">${escapeHtml(label)}</td>
            <td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:13px;line-height:1.5;">${escapeHtml(value)}</td>
          </tr>
        `
        : "";

    customerHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(customerSubject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">
  Merci pour votre commande&nbsp;! Récapitulatif inclus. Notre équipe vous contactera sous 24h.
</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f7;padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 16px;border-bottom:1px solid #ececec;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.3px;color:#1a1a1a;">
              <span style="color:#1a1a1a;">Tech</span><span style="color:#6b3fa0;">Xpress</span> <span style="color:#6b7280;font-weight:400;font-size:14px;">DZ</span>
            </p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:32px 32px 8px;">
            <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;color:#6b3fa0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
              Commande confirmée
            </p>
            <h1 style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:24px;line-height:1.3;font-weight:700;letter-spacing:-0.5px;">
              Merci ${escapeHtml(prenom)}, on a bien reçu votre commande.
            </h1>
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#4b5563;font-size:14px;line-height:1.6;">
              Notre équipe vous contactera sous <strong style="color:#1a1a1a;">24&nbsp;heures</strong> pour confirmer la livraison.
            </p>
          </td>
        </tr>

        <!-- Order summary -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
              Récapitulatif
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${productRows}
              <tr>
                <td style="padding:14px 0 2px;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:13px;">
                  Sous-total
                </td>
                <td style="padding:14px 0 2px;text-align:right;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:13px;font-weight:600;white-space:nowrap;">
                  ${totalCalc.toLocaleString("fr-DZ")} DA
                </td>
              </tr>
              <tr>
                <td style="padding:4px 0;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:13px;">
                  Livraison <span style="color:#9ca3af;font-size:11px;">(${escapeHtml(shippingLabel)})</span>
                </td>
                <td style="padding:4px 0;text-align:right;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:13px;font-weight:600;white-space:nowrap;">
                  ${shippingFee.toLocaleString("fr-DZ")} DA
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:8px;"><div style="border-top:1px solid #ececec;"></div></td>
              </tr>
              <tr>
                <td style="padding:10px 0 0;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:15px;font-weight:700;">
                  Total
                </td>
                <td style="padding:10px 0 0;text-align:right;font-family:Helvetica,Arial,sans-serif;color:#6b3fa0;font-size:20px;font-weight:700;white-space:nowrap;">
                  ${grandTotal.toLocaleString("fr-DZ")} DA
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Delivery info -->
        <tr>
          <td style="padding:32px 32px 8px;">
            <p style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
              Livraison
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${infoRow("Nom complet", `${prenom} ${nom}`)}
              ${infoRow("Téléphone", phoneClean)}
              ${infoRow("Adresse", adresse)}
              ${codePostal ? infoRow("Code postal", codePostal) : ""}
              ${infoRow("Daïra", daira)}
              ${infoRow("Wilaya", wilaya)}
              ${infoRow("Mode", shippingLabel)}
              ${message ? infoRow("Note", message) : ""}
            </table>
          </td>
        </tr>

        <!-- Payment notice -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9f6ff;border:1px solid #e5d6ff;border-radius:10px;">
              <tr>
                <td style="padding:16px 18px;font-family:Helvetica,Arial,sans-serif;color:#3b2462;font-size:13px;line-height:1.6;">
                  <strong style="color:#1a1a1a;">Paiement à la livraison.</strong> Aucun paiement en ligne&nbsp;: vous réglez en espèces à la réception du colis.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Help -->
        <tr>
          <td style="padding:24px 32px 32px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
              Une question&nbsp;? Répondez simplement à cet email ou contactez-nous sur WhatsApp.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #ececec;text-align:center;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#9ca3af;font-size:11px;line-height:1.5;">
              TechXpress DZ &middot; <a href="https://techxpressdz.com" style="color:#6b3fa0;text-decoration:none;">techxpressdz.com</a><br>
              Livraison dans les 58 wilayas d'Algérie.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    // Plain-text fallback (boosts spam score, required by many filters)
    const productLinesTxt = items
      .map((item) => {
        const p = item?.product || {};
        const qty = Math.max(1, Math.min(99, Number(item?.quantity) || 1));
        const isAbonnement = item?.optionAbonnement === "box-abonnement";
        const variantNom = trim(item?.variantNom || "", 80);
        const variantPrix = Number(item?.variantPrix);
        const today = new Date().toISOString().split("T")[0];
        const promoActive =
          Number(p.prixPromo) > 0 &&
          Number(p.prixPromo) < Number(p.prix) &&
          (!p.dateDebutPromo || p.dateDebutPromo <= today) &&
          (!p.dateFinPromo || p.dateFinPromo >= today);
        const prixBase = promoActive ? Number(p.prixPromo) : Number(p.prix) || 0;
        const unit =
          variantPrix > 0
            ? variantPrix
            : isAbonnement && Number(p.prixAvecAbonnement) > 0
            ? Number(p.prixAvecAbonnement)
            : prixBase;
        const label = `${p.nom || "Produit"}${variantNom ? ` (${variantNom})` : ""}${isAbonnement ? ", avec abonnement TV" : ""}`;
        return `- ${label} x${qty} — ${(unit * qty).toLocaleString("fr-DZ")} DA`;
      })
      .join("\n");

    const customerText = `TechXpress DZ — Confirmation de commande

Merci ${prenom}, votre commande a bien été reçue. Notre équipe vous contactera sous 24 heures pour confirmer la livraison.

RÉCAPITULATIF
${productLinesTxt}

Sous-total : ${totalCalc.toLocaleString("fr-DZ")} DA
Livraison (${shippingLabel}) : ${shippingFee.toLocaleString("fr-DZ")} DA
Total : ${grandTotal.toLocaleString("fr-DZ")} DA

LIVRAISON
Nom : ${prenom} ${nom}
Téléphone : ${phoneClean}
Adresse : ${adresse}${codePostal ? `\nCode postal : ${codePostal}` : ""}
Daïra : ${daira}
Wilaya : ${wilaya}
Mode : ${shippingLabel}${message ? `\nNote : ${message}` : ""}

Paiement à la livraison — aucun paiement en ligne.

Une question ? Répondez à cet email ou contactez-nous sur WhatsApp.

—
TechXpress DZ
https://techxpressdz.com`;

    // Send admin email
    const adminRes = await sendEmail(apiKey, { from: fromEmail, to: toEmail, subject: adminSubject, html: adminHtml });
    if (!adminRes.ok) {
      const err = await adminRes.text();
      return new Response(JSON.stringify({ error: "Échec d'envoi", detail: err }), {
        status: 502,
        headers: baseHeaders,
      });
    }

    // Send customer confirmation + save to Supabase, both wrapped in waitUntil
    // so Cloudflare keeps the request alive after the Response is returned.
    // Without waitUntil, in-flight async work is cancelled the moment the
    // response is sent.
    const customerSend = sendEmail(apiKey, {
      from: fromEmail,
      to: customerEmail,
      subject: customerSubject,
      html: customerHtml,
      text: customerText,
      replyTo: toEmail,
    })
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          console.error(`[commande] customer email failed ${r.status}: ${t}`);
        }
      })
      .catch((e) => {
        console.error(`[commande] customer email exception:`, e?.message || e);
      });

    // Await Supabase save inline so we can surface diagnostic info in the
    // response. Customer email keeps the waitUntil pattern (no need to block
    // the user).
    let supabaseResult;
    try {
      supabaseResult = await saveToSupabase(env, {
        user_id: userId,
        email,
        prenom,
        nom,
        adresse: adresseComplete,
        telephone: phoneClean,
        wilaya,
        message: message || null,
        items: items,
        total: grandTotal,
        total_price: grandTotal,
        shipping_fee: shippingFee,
        shipping_option: shippingOption,
        statut: "en_attente",
      });
    } catch (e) {
      console.error(`[commande] Supabase save exception:`, e?.message || e);
      supabaseResult = { ok: false, status: 0, error: String(e?.message || e) };
    }

    if (typeof waitUntil === "function") {
      waitUntil(customerSend);
    } else {
      await customerSend;
    }

    return new Response(
      JSON.stringify({
        success: true,
        _supabase: supabaseResult,
      }),
      { headers: baseHeaders }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur serveur", detail: String(err?.message || err) }), {
      status: 500,
      headers: baseHeaders,
    });
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, { headers: corsHeaders(origin) });
}
