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
  // Origines autorisées : domaine de production + previews pages.dev
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

    let subject, html;

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

      subject = `Nouveau message — ${escapeHtml(nom)}`;
      html = `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email) || "—"}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(telephone) || "—"}</p>
        <p><strong>Message :</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `;
    } else {
      const prenom = trim(data.prenom, 80);
      const nom = trim(data.nom, 80);
      const adresse = trim(data.adresse, 300);
      const telephone = trim(data.telephone, 30);
      const wilaya = trim(data.wilaya, 80);
      const message = trim(data.message, 1000);
      const items = Array.isArray(data.items) ? data.items.slice(0, 50) : [];

      if (!prenom || !nom || !adresse || !telephone || !wilaya) {
        return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
          status: 400,
          headers: baseHeaders,
        });
      }
      // Téléphone algérien : 05/06/07 + 8 chiffres ou +213 + 9 chiffres
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

      // Re-calcul du total côté serveur (sécurité : ne jamais faire confiance au client)
      let totalCalc = 0;
      const itemRows = items
        .map((item) => {
          const p = item?.product || {};
          const qty = Math.max(1, Math.min(99, Number(item?.quantity) || 1));
          const isAbonnement = item?.optionAbonnement === "box-abonnement";
          const unit =
            isAbonnement && Number(p.prixAbonnement) > 0
              ? Number(p.prixAbonnement)
              : Number(p.prix) || 0;
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

      subject = `Nouvelle commande — ${escapeHtml(prenom)} ${escapeHtml(nom)}`.trim();
      html = `
        <h2>Nouvelle commande</h2>
        <h3>Informations client</h3>
        <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
        <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
        <p><strong>Adresse :</strong> ${escapeHtml(adresse)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(phoneClean)}</p>
        <p><strong>Wilaya :</strong> ${escapeHtml(wilaya)}</p>
        ${message ? `<p><strong>Note :</strong> ${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
        <h3>Produits commandés</h3>
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
        <p style="color:#666;font-size:12px;">Paiement à la livraison — aucune somme à encaisser en ligne.</p>
      `;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      return new Response(JSON.stringify({ error: "Échec d'envoi", detail: err }), {
        status: 502,
        headers: baseHeaders,
      });
    }

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
