export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const apiKey = env.RESEND_API_KEY;
    const toEmail = env.RESEND_TO_EMAIL;

    if (!toEmail) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    let subject, html;

    if (data.type === "contact") {
      subject = `Nouveau message de contact — ${data.nom || "Anonyme"}`;
      html = `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${data.nom || "—"}</p>
        <p><strong>Email :</strong> ${data.email || "—"}</p>
        <p><strong>Téléphone :</strong> ${data.telephone || "—"}</p>
        <p><strong>Message :</strong></p>
        <p>${(data.message || "").replace(/\n/g, "<br>")}</p>
      `;
    } else {
      const items = data.items || [];
      const itemRows = items.map(item => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${item.product?.nom || "—"}</td>
          <td style="padding:8px;border:1px solid #ddd;">${item.quantity || 1}</td>
          <td style="padding:8px;border:1px solid #ddd;">${item.product?.prix?.toLocaleString("fr-DZ") || "—"} DA</td>
        </tr>
      `).join("");

      subject = `Nouvelle commande — ${data.prenom || ""} ${data.nom || ""}`.trim() || "Nouvelle commande";
      html = `
        <h2>Nouvelle commande</h2>
        <h3>Informations client</h3>
        <p><strong>Prénom :</strong> ${data.prenom || "—"}</p>
        <p><strong>Nom :</strong> ${data.nom || "—"}</p>
        <p><strong>Adresse :</strong> ${data.adresse || "—"}</p>
        <p><strong>Téléphone :</strong> ${data.telephone || "—"}</p>
        <p><strong>Wilaya :</strong> ${data.wilaya || "—"}</p>
        ${data.message ? `<p><strong>Note :</strong> ${data.message}</p>` : ""}
        <h3>Produits commandés</h3>
        <table style="border-collapse:collapse;width:100%;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Produit</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Qté</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;">Prix</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p><strong>Total :</strong> ${(data.totalPrice || 0).toLocaleString("fr-DZ")} DA</p>
      `;
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tech Xpress <onboarding@resend.dev>",
        to: [toEmail],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
