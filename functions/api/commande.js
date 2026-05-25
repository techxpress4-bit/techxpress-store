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

async function sendEmail(apiKey, { from, to, subject, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  return res;
}

async function saveToSupabase(env, payload) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  await fetch(`${url}/rest/v1/commandes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
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
    const telephone = trim(data.telephone, 30);
    const wilaya = trim(data.wilaya, 80);
    const message = trim(data.message, 1000);
    const email = trim(data.email, 150);
    const userId = typeof data.userId === "string" ? data.userId : null;
    const items = Array.isArray(data.items) ? data.items.slice(0, 50) : [];

    if (!prenom || !nom || !adresse || !telephone || !wilaya) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: baseHeaders,
      });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: baseHeaders,
      });
    }
    const phoneClean = telephone.replace(/\s|-|\./g, "");
    if (!/^(?:0[567]\d{8}|\+213[567]\d{8})$/.test(phoneClean)) {
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
        const today = new Date().toISOString().split("T")[0];
        const promoActive = Number(p.prixPromo) > 0 && Number(p.prixPromo) < Number(p.prix) &&
          (!p.dateDebutPromo || p.dateDebutPromo <= today) &&
          (!p.dateFinPromo || p.dateFinPromo >= today);
        const prixBase = promoActive ? Number(p.prixPromo) : Number(p.prix) || 0;
        const unit =
          isAbonnement && Number(p.prixAvecAbonnement) > 0
            ? Number(p.prixAvecAbonnement)
            : prixBase;
        const ligneTotal = unit * qty;
        totalCalc += ligneTotal;
        const label = isAbonnement ? " (avec abonnement TV)" : "";
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
      <p style="margin-top:14px;"><strong>Total commande :</strong> ${totalCalc.toLocaleString("fr-DZ")} DA</p>
    `;

    // Admin email
    adminSubject = `Nouvelle commande — ${escapeHtml(prenom)} ${escapeHtml(nom)}`.trim();
    adminHtml = `
      <h2>Nouvelle commande</h2>
      <h3>Informations client</h3>
      <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
      <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
      <p><strong>Adresse :</strong> ${escapeHtml(adresse)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(phoneClean)}</p>
      <p><strong>Wilaya :</strong> ${escapeHtml(wilaya)}</p>
      <p><strong>Email client :</strong> ${escapeHtml(email)}</p>
      ${message ? `<p><strong>Note :</strong> ${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
      <h3>Produits commandés</h3>
      ${orderTableHtml}
      <p style="color:#666;font-size:12px;">Paiement à la livraison — aucune somme à encaisser en ligne.</p>
    `;

    // Customer confirmation email
    customerEmail = email;
    customerSubject = `Votre commande TechXpress a bien été reçue`;
    customerHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
          <div style="background:#161616;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6b3fa0,#4a1d7a);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:-0.5px;">TechXpress DZ</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Votre destination tech en Algérie</p>
            </div>
            <!-- Body -->
            <div style="padding:32px;">
              <div style="background:rgba(107,63,160,0.12);border:1px solid rgba(107,63,160,0.25);border-radius:12px;padding:16px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
                <span style="font-size:24px;">✅</span>
                <div>
                  <p style="margin:0;color:#ffffff;font-weight:bold;font-size:15px;">Commande reçue !</p>
                  <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">Notre équipe vous contactera sous <strong style="color:#f5f5f5;">24h</strong> pour confirmer la livraison.</p>
                </div>
              </div>

              <p style="color:#f5f5f5;margin:0 0 4px;font-size:15px;">Bonjour <strong>${escapeHtml(prenom)}</strong>,</p>
              <p style="color:#9ca3af;margin:0 0 24px;font-size:14px;line-height:1.6;">Merci pour votre commande. Voici le récapitulatif :</p>

              <!-- Customer info -->
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;width:120px;">Nom complet</td>
                  <td style="padding:8px 0;color:#f5f5f5;font-size:13px;">${escapeHtml(prenom)} ${escapeHtml(nom)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #1f1f1f;">Téléphone</td>
                  <td style="padding:8px 0;color:#f5f5f5;font-size:13px;border-top:1px solid #1f1f1f;">${escapeHtml(phoneClean)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #1f1f1f;">Wilaya</td>
                  <td style="padding:8px 0;color:#f5f5f5;font-size:13px;border-top:1px solid #1f1f1f;">${escapeHtml(wilaya)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #1f1f1f;">Adresse</td>
                  <td style="padding:8px 0;color:#f5f5f5;font-size:13px;border-top:1px solid #1f1f1f;">${escapeHtml(adresse)}</td>
                </tr>
                ${message ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #1f1f1f;">Note</td><td style="padding:8px 0;color:#f5f5f5;font-size:13px;border-top:1px solid #1f1f1f;">${escapeHtml(message)}</td></tr>` : ""}
              </table>

              <!-- Products -->
              <h3 style="color:#ffffff;font-size:14px;font-weight:bold;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.05em;">Produits commandés</h3>
              <div style="background:#111111;border:1px solid #2a2a2a;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                ${items.map((item) => {
                  const p = item?.product || {};
                  const qty = Math.max(1, Math.min(99, Number(item?.quantity) || 1));
                  const isAbonnement = item?.optionAbonnement === "box-abonnement";
                  const today = new Date().toISOString().split("T")[0];
                  const promoActive = Number(p.prixPromo) > 0 && Number(p.prixPromo) < Number(p.prix) &&
                    (!p.dateDebutPromo || p.dateDebutPromo <= today) &&
                    (!p.dateFinPromo || p.dateFinPromo >= today);
                  const prixBase = promoActive ? Number(p.prixPromo) : Number(p.prix) || 0;
                  const unit = isAbonnement && Number(p.prixAvecAbonnement) > 0 ? Number(p.prixAvecAbonnement) : prixBase;
                  return `<div style="padding:12px 16px;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <p style="margin:0;color:#f5f5f5;font-size:13px;font-weight:600;">${escapeHtml(p.nom || "—")}</p>
                      ${isAbonnement ? `<p style="margin:2px 0 0;color:#9ca3af;font-size:11px;">Avec abonnement TV</p>` : ""}
                      <p style="margin:2px 0 0;color:#6b7280;font-size:11px;">Qté : ${qty}</p>
                    </div>
                    <p style="margin:0;color:#c084fc;font-weight:bold;font-size:14px;white-space:nowrap;">${(unit * qty).toLocaleString("fr-DZ")} DA</p>
                  </div>`;
                }).join("")}
                <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;background:rgba(107,63,160,0.08);">
                  <span style="color:#ffffff;font-weight:bold;font-size:14px;">Total</span>
                  <span style="color:#c084fc;font-weight:bold;font-size:18px;">${totalCalc.toLocaleString("fr-DZ")} DA</span>
                </div>
              </div>

              <!-- Payment notice -->
              <div style="background:#111111;border:1px solid #2a2a2a;border-radius:10px;padding:14px 16px;margin-bottom:24px;display:flex;align-items:center;gap:10px;">
                <span style="font-size:20px;">💵</span>
                <p style="margin:0;color:#9ca3af;font-size:13px;">Paiement à la livraison — aucun paiement en ligne requis. Vous payez à la réception de votre colis.</p>
              </div>

              <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">Des questions ? Contactez-nous sur WhatsApp ou via notre site.</p>
            </div>
            <!-- Footer -->
            <div style="padding:16px 32px;text-align:center;border-top:1px solid #1f1f1f;">
              <p style="margin:0;color:#4b5563;font-size:11px;">© 2025 TechXpress DZ — techxpressdz.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send admin email
    const adminRes = await sendEmail(apiKey, { from: fromEmail, to: toEmail, subject: adminSubject, html: adminHtml });
    if (!adminRes.ok) {
      const err = await adminRes.text();
      return new Response(JSON.stringify({ error: "Échec d'envoi", detail: err }), {
        status: 502,
        headers: baseHeaders,
      });
    }

    // Send customer confirmation (non-blocking — don't fail the order if this fails)
    sendEmail(apiKey, { from: fromEmail, to: customerEmail, subject: customerSubject, html: customerHtml }).catch(() => {});

    // Save to Supabase (non-blocking)
    saveToSupabase(env, {
      user_id: userId,
      email,
      prenom,
      nom,
      adresse,
      telephone: phoneClean,
      wilaya,
      message: message || null,
      items: items,
      total: totalCalc,
      statut: "en_attente",
    }).catch(() => {});

    return new Response(JSON.stringify({ success: true }), { headers: baseHeaders });
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
