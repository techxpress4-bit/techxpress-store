// Cloudflare Pages Function — POST /api/admin/order-status
// Updates a commande's statut + notifies the customer by email.
// Auth: requires a Supabase access_token whose email is in ADMIN_EMAILS.

const ADMIN_EMAILS = ["qlkdu33@gmail.com", "techxpress4@gmail.com"];

const ALLOWED_STATUSES = [
  "en_attente",
  "confirmee",
  "en_livraison",
  "livree",
  "annulee",
];

const STATUS_COPY = {
  confirmee: {
    subject: "Votre commande TechXpress est confirmée",
    title: "Commande confirmée",
    body: "Bonne nouvelle&nbsp;! Votre commande a été confirmée. Notre équipe prépare votre colis et vous tiendra informé dès l'envoi.",
    textBody:
      "Bonne nouvelle ! Votre commande a été confirmée. Notre équipe prépare votre colis et vous tiendra informé dès l'envoi.",
    accent: "#16a34a",
  },
  en_livraison: {
    subject: "Votre commande TechXpress est en livraison",
    title: "Colis en livraison",
    body: "Votre commande est en route&nbsp;! Le livreur vous contactera très prochainement par téléphone pour fixer la remise du colis.",
    textBody:
      "Votre commande est en route ! Le livreur vous contactera très prochainement par téléphone pour fixer la remise du colis.",
    accent: "#2563eb",
  },
  livree: {
    subject: "Votre commande TechXpress a été livrée",
    title: "Commande livrée",
    body: "Votre commande a bien été livrée. Merci pour votre confiance&nbsp;! N'hésitez pas à laisser un avis sur les produits que vous avez reçus.",
    textBody:
      "Votre commande a bien été livrée. Merci pour votre confiance ! N'hésitez pas à laisser un avis sur les produits que vous avez reçus.",
    accent: "#6b3fa0",
  },
  annulee: {
    subject: "Votre commande TechXpress a été annulée",
    title: "Commande annulée",
    body: "Votre commande a été annulée. Si vous avez une question ou si vous souhaitez la repasser, contactez-nous sur WhatsApp.",
    textBody:
      "Votre commande a été annulée. Si vous avez une question ou si vous souhaitez la repasser, contactez-nous sur WhatsApp.",
    accent: "#dc2626",
  },
};

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function corsHeaders(origin) {
  const allowList = ["https://techxpressdz.com", "https://www.techxpressdz.com"];
  let allow = "null";
  if (origin && (allowList.includes(origin) || /\.pages\.dev$/.test(new URL(origin).hostname))) {
    allow = origin;
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

// Decode the JWT payload (no signature verification — we re-verify by calling
// Supabase auth/v1/user with the token below, which is the source of truth).
function jwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const padded = payload + "===".slice(0, (4 - (payload.length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function verifyAdmin(env, token) {
  if (!token) return { ok: false, reason: "no_token" };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: false, reason: "supabase_misconfigured" };
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anon },
  });
  if (!res.ok) return { ok: false, reason: "invalid_token" };
  const user = await res.json();
  const email = String(user?.email || "").toLowerCase();
  if (!ADMIN_EMAILS.includes(email)) return { ok: false, reason: "not_admin", email };
  return { ok: true, email };
}

async function fetchOrder(env, orderId) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  const res = await fetch(
    `${url}/rest/v1/commandes?id=eq.${encodeURIComponent(orderId)}&select=*`,
    { headers: { Authorization: `Bearer ${key}`, apikey: key } }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : null;
}

async function updateOrderStatus(env, orderId, newStatus) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_KEY;
  const res = await fetch(
    `${url}/rest/v1/commandes?id=eq.${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ statut: newStatus }),
    }
  );
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    return { ok: false, status: res.status, error: errTxt };
  }
  return { ok: true };
}

function buildStatusEmail({ prenom, statusCopy, orderRef, totalDA }) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(statusCopy.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(statusCopy.textBody)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f5f7;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:28px 32px 16px;border-bottom:1px solid #ececec;">
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.3px;color:#1a1a1a;">
          <span style="color:#1a1a1a;">Tech</span><span style="color:#6b3fa0;">Xpress</span> <span style="color:#6b7280;font-weight:400;font-size:14px;">DZ</span>
        </p>
      </td></tr>
      <tr><td style="padding:32px 32px 8px;">
        <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;color:${statusCopy.accent};font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
          ${escapeHtml(statusCopy.title)}
        </p>
        <h1 style="margin:0 0 12px;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-0.5px;">
          Bonjour ${escapeHtml(prenom || "")},
        </h1>
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#4b5563;font-size:14px;line-height:1.6;">
          ${statusCopy.body}
        </p>
      </td></tr>
      <tr><td style="padding:24px 32px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#fafafa;border:1px solid #ececec;border-radius:10px;">
          <tr>
            <td style="padding:14px 18px;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:12px;">Commande</td>
            <td style="padding:14px 18px;text-align:right;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;font-size:13px;font-weight:600;">#${escapeHtml(orderRef)}</td>
          </tr>
          <tr>
            <td style="padding:14px 18px;border-top:1px solid #ececec;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:12px;">Total</td>
            <td style="padding:14px 18px;border-top:1px solid #ececec;text-align:right;font-family:Helvetica,Arial,sans-serif;color:#6b3fa0;font-size:15px;font-weight:700;">${escapeHtml(totalDA)} DA</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 32px 32px;">
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
          Une question&nbsp;? Répondez à cet email ou contactez-nous sur WhatsApp.
        </p>
      </td></tr>
      <tr><td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #ececec;text-align:center;">
        <p style="margin:0;font-family:Helvetica,Arial,sans-serif;color:#9ca3af;font-size:11px;line-height:1.5;">
          TechXpress DZ &middot; <a href="https://techxpressdz.com" style="color:#6b3fa0;text-decoration:none;">techxpressdz.com</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = `TechXpress DZ — ${statusCopy.title}

Bonjour ${prenom || ""},

${statusCopy.textBody}

Commande : #${orderRef}
Total    : ${totalDA} DA

Une question ? Répondez à cet email ou contactez-nous sur WhatsApp.

—
TechXpress DZ
https://techxpressdz.com`;

  return { html, text };
}

async function sendStatusEmail(env, { to, statusCopy, prenom, orderRef, totalDA }) {
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "TechXpress DZ <commandes@techxpressdz.com>";
  const replyTo = env.RESEND_TO_EMAIL;
  if (!apiKey) return { ok: false, error: "resend_misconfigured" };
  const { html, text } = buildStatusEmail({ prenom, statusCopy, orderRef, totalDA });
  const body = { from: fromEmail, to: [to], subject: statusCopy.subject, html, text };
  if (replyTo) body.reply_to = replyTo;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return { ok: false, status: res.status, error: t };
  }
  return { ok: true };
}

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;
  const origin = request.headers.get("Origin") || "";
  const headers = { "Content-Type": "application/json", ...corsHeaders(origin) };

  try {
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    const adminCheck = await verifyAdmin(env, token);
    if (!adminCheck.ok) {
      return new Response(JSON.stringify({ error: "Forbidden", reason: adminCheck.reason }), {
        status: 403,
        headers,
      });
    }

    const body = await request.json();
    const orderId = String(body?.orderId || "").trim();
    const newStatus = String(body?.newStatus || "").trim();

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId manquant" }), { status: 400, headers });
    }
    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return new Response(JSON.stringify({ error: "Statut invalide" }), { status: 400, headers });
    }

    const order = await fetchOrder(env, orderId);
    if (!order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), { status: 404, headers });
    }

    const previousStatus = order.statut;
    if (previousStatus === newStatus) {
      return new Response(JSON.stringify({ success: true, unchanged: true }), { headers });
    }

    const update = await updateOrderStatus(env, orderId, newStatus);
    if (!update.ok) {
      return new Response(JSON.stringify({ error: "Update Supabase échoué", detail: update.error }), {
        status: 502,
        headers,
      });
    }

    // Send notification email (skip for en_attente reverts — they're admin slip)
    const statusCopy = STATUS_COPY[newStatus];
    let emailResult = { ok: true, skipped: true };
    if (statusCopy && order.email) {
      const orderRef = String(order.id).slice(0, 8).toUpperCase();
      const totalDA = Number(order.total ?? order.total_price ?? 0).toLocaleString("fr-DZ");
      const send = sendStatusEmail(env, {
        to: order.email,
        statusCopy,
        prenom: order.prenom,
        orderRef,
        totalDA,
      });
      if (typeof waitUntil === "function") {
        waitUntil(send);
        emailResult = { ok: true, queued: true };
      } else {
        emailResult = await send;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        previousStatus,
        newStatus,
        email: emailResult,
      }),
      { headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur serveur", detail: String(err?.message || err) }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, { headers: corsHeaders(origin) });
}
