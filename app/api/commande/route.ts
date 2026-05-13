import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CartItem } from "@/lib/types";
import { getItemPrice } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { writeClient } from "@/lib/sanity";

const resend = new Resend(process.env.RESEND_API_KEY);

// --- Helpers ---

function esc(val: unknown): string {
  if (val == null) return "";
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Best-effort rate limiting (per Cloudflare isolate)
const rateMap = new Map<string, { count: number; ts: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const WINDOW = 60_000;
  const MAX = 5;
  const entry = rateMap.get(ip);
  if (!entry || now - entry.ts > WINDOW) {
    rateMap.set(ip, { count: 1, ts: now });
    return false;
  }
  if (entry.count >= MAX) return true;
  entry.count++;
  return false;
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("CF-Connecting-IP") ||
    req.headers.get("X-Forwarded-For")?.split(",")[0].trim() ||
    "unknown"
  );
}

// --- Email formatters ---

function formatOrderEmail(data: {
  prenom?: string;
  nom?: string;
  adresse?: string;
  telephone: string;
  wilaya?: string;
  message?: string;
  items?: CartItem[];
  totalPrice?: number;
  type?: string;
  email?: string;
  orderRef?: string;
}): { subject: string; html: string } {
  if (data.type === "contact") {
    return {
      subject: `[Contact] Message de ${esc(data.nom)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6B3FA0, #4E2D7A); padding: 24px;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Nouveau message — Tech Xpress</h1>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #9ca3af; width: 120px;">Nom :</td><td style="color: #f5f5f5;">${esc(data.nom)}</td></tr>
              <tr><td style="padding: 8px 0; color: #9ca3af;">Téléphone :</td><td style="color: #f5f5f5;">${esc(data.telephone)}</td></tr>
              <tr><td style="padding: 8px 0; color: #9ca3af;">Email :</td><td style="color: #f5f5f5;">${esc(data.email)}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #161616; border-radius: 8px; border-left: 3px solid #6B3FA0;">
              <p style="margin: 0; color: #f5f5f5;">${esc(data.message)}</p>
            </div>
          </div>
        </div>`,
    };
  }

  const itemsHtml =
    data.items
      ?.map((item) => {
        const price = getItemPrice(item);
        return `
      <tr style="border-bottom: 1px solid #2a2a2a;">
        <td style="padding: 10px 0; color: #f5f5f5;">${esc(item.product.nom)}${item.optionAbonnement ? `<br><small style="color:#9ca3af;">${item.optionAbonnement === "box-abonnement" ? "Box + Abonnement TV" : "Box seule"}</small>` : ""}</td>
        <td style="padding: 10px 0; color: #9ca3af; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; color: #f5f5f5; text-align: right; font-weight: bold;">${(price * item.quantity).toLocaleString("fr-DZ")} DA</td>
      </tr>`;
      })
      .join("") || "";

  return {
    subject: `🛍️ Nouvelle commande — ${esc(data.prenom)} ${esc(data.nom)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6B3FA0, #4E2D7A); padding: 24px 24px 20px;">
          <h1 style="margin: 0 0 4px; color: white; font-size: 22px;">Nouvelle commande</h1>
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">Tech Xpress — Paiement à la livraison${data.orderRef ? ` · Réf. ${esc(data.orderRef)}` : ""}</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8b5fc0; margin: 0 0 12px;">Client</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 6px 0; color: #9ca3af; width: 130px;">Nom :</td><td style="color: #f5f5f5; font-weight: bold;">${esc(data.prenom)} ${esc(data.nom)}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Téléphone :</td><td style="color: #f5f5f5; font-weight: bold; font-size: 16px;">${esc(data.telephone)}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Wilaya :</td><td style="color: #f5f5f5;">${esc(data.wilaya)}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Adresse :</td><td style="color: #f5f5f5;">${esc(data.adresse)}</td></tr>
            ${data.message ? `<tr><td style="padding: 6px 0; color: #9ca3af;">Message :</td><td style="color: #f5f5f5; font-style: italic;">${esc(data.message)}</td></tr>` : ""}
          </table>

          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8b5fc0; margin: 0 0 12px;">Produits commandés</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #2a2a2a;">
                <th style="text-align: left; padding: 8px 0; color: #6b7280; font-size: 12px; font-weight: 500;">Produit</th>
                <th style="text-align: center; padding: 8px 0; color: #6b7280; font-size: 12px; font-weight: 500;">Qté</th>
                <th style="text-align: right; padding: 8px 0; color: #6b7280; font-size: 12px; font-weight: 500;">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="background: #161616; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #2a2a2a;">
            <span style="font-size: 16px; font-weight: bold; color: white;">Total</span>
            <span style="font-size: 22px; font-weight: 800; color: white;">${data.totalPrice?.toLocaleString("fr-DZ")} DA</span>
          </div>

          <div style="margin-top: 20px; padding: 14px; background: rgba(107,63,160,0.1); border-radius: 8px; border: 1px solid rgba(107,63,160,0.25);">
            <p style="margin: 0; font-size: 13px; color: #9ca3af;">
              💵 <strong style="color: white;">Paiement à la livraison</strong> — Contacter le client sous 24h pour confirmer.
            </p>
          </div>
        </div>
      </div>`,
  };
}

function formatClientConfirmationEmail(data: {
  prenom: string;
  nom: string;
  items: CartItem[];
  totalPrice: number;
  wilaya: string;
  orderRef: string;
}): string {
  const itemsHtml = data.items
    .map((item) => {
      const price = getItemPrice(item);
      return `
    <tr style="border-bottom: 1px solid #2a2a2a;">
      <td style="padding: 10px 0; color: #f5f5f5; font-size: 13px;">${esc(item.product.nom)}${item.optionAbonnement ? `<br><small style="color:#9ca3af;">${item.optionAbonnement === "box-abonnement" ? "Box + Abonnement TV" : "Box seule"}</small>` : ""}</td>
      <td style="padding: 10px 0; color: #9ca3af; text-align: center; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 10px 0; color: #f5f5f5; text-align: right; font-weight: bold; font-size: 13px;">${(price * item.quantity).toLocaleString("fr-DZ")} DA</td>
    </tr>`;
    })
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #6B3FA0, #4E2D7A); padding: 28px 24px;">
        <h1 style="margin: 0 0 6px; color: white; font-size: 22px;">Commande confirmée ✓</h1>
        <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">Merci ${esc(data.prenom)}, votre commande a bien été reçue. Réf. <strong style="color:white;">${esc(data.orderRef)}</strong></p>
      </div>

      <div style="padding: 24px;">
        <div style="margin-bottom: 24px; padding: 16px; background: rgba(34,197,94,0.08); border-radius: 10px; border: 1px solid rgba(34,197,94,0.2);">
          <p style="margin: 0; font-size: 14px; color: #f5f5f5;">
            Notre équipe vous contactera sous <strong>24h</strong> au numéro indiqué pour confirmer et organiser la livraison vers <strong>${esc(data.wilaya)}</strong>.
          </p>
        </div>

        <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #8b5fc0; margin: 0 0 12px;">Votre commande</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="border-bottom: 2px solid #2a2a2a;">
              <th style="text-align: left; padding: 8px 0; color: #6b7280; font-size: 11px; font-weight: 500;">Produit</th>
              <th style="text-align: center; padding: 8px 0; color: #6b7280; font-size: 11px; font-weight: 500;">Qté</th>
              <th style="text-align: right; padding: 8px 0; color: #6b7280; font-size: 11px; font-weight: 500;">Prix</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="background: #161616; border-radius: 8px; padding: 14px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #2a2a2a; margin-bottom: 20px;">
          <span style="font-weight: bold; color: white; font-size: 15px;">Total</span>
          <span style="font-size: 20px; font-weight: 800; color: white;">${data.totalPrice.toLocaleString("fr-DZ")} DA</span>
        </div>

        <div style="padding: 14px; background: rgba(107,63,160,0.08); border-radius: 8px; border: 1px solid rgba(107,63,160,0.2);">
          <p style="margin: 0; font-size: 13px; color: #9ca3af;">
            💵 <strong style="color: white;">Paiement à la livraison</strong> — vous payez uniquement à la réception de votre colis.
          </p>
        </div>

        <p style="margin-top: 24px; font-size: 12px; color: #4b5563; text-align: center;">
          Tech Xpress — Votre boutique tech en Algérie
        </p>
      </div>
    </div>`;
}

// --- Route handler ---

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getIP(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
    }

    const data = await req.json();

    // Input validation
    if (data.type !== "contact") {
      if (!data.prenom?.trim() || !data.nom?.trim() || !data.telephone?.trim() || !data.wilaya?.trim() || !data.adresse?.trim()) {
        return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
      }
      if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 50) {
        return NextResponse.json({ error: "Panier invalide" }, { status: 400 });
      }
      if (typeof data.totalPrice !== "number" || data.totalPrice <= 0 || data.totalPrice > 10_000_000) {
        return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
      }
    } else {
      if (!data.telephone?.trim()) {
        return NextResponse.json({ error: "Téléphone requis" }, { status: 400 });
      }
    }

    const to = process.env.RESEND_TO_EMAIL;
    if (!to) {
      return NextResponse.json({ error: "Email destination non configuré" }, { status: 500 });
    }

    // Generate order reference (for display only)
    const orderRef = `TXP-${Date.now().toString(36).toUpperCase()}`;

    const { subject, html } = formatOrderEmail({ ...data, orderRef });

    // Admin notification email
    const { error } = await resend.emails.send({
      from: "Tech Xpress <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
    }

    // Get user session (optional)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Client confirmation email (logged-in users)
    if (user?.email && data.type !== "contact") {
      resend.emails.send({
        from: "Tech Xpress <onboarding@resend.dev>",
        to: [user.email],
        subject: `✓ Commande reçue — Réf. ${orderRef}`,
        html: formatClientConfirmationEmail({
          prenom: data.prenom,
          nom: data.nom,
          items: data.items,
          totalPrice: data.totalPrice,
          wilaya: data.wilaya,
          orderRef,
        }),
      }).catch((e) => console.error("Client email error:", e));
    }

    // Save order to DB (non-blocking)
    if (data.type !== "contact") {
      supabase.from("commandes").insert({
        user_id: user?.id ?? null,
        prenom: data.prenom,
        nom: data.nom,
        adresse: data.adresse,
        telephone: data.telephone,
        wilaya: data.wilaya,
        message: data.message || null,
        items: data.items,
        total_price: data.totalPrice,
        statut: "en_attente",
      }).then(({ error: dbErr }) => {
        if (dbErr) console.error("DB save error:", dbErr);
      });
    }

    // Decrement stockQuantite in Sanity (non-blocking, requires SANITY_WRITE_TOKEN)
    if (data.type !== "contact" && process.env.SANITY_WRITE_TOKEN) {
      (async () => {
        try {
          for (const item of data.items as CartItem[]) {
            const p = await writeClient.fetch<{ _id: string; stockQuantite: number | null }>(
              `*[_type == "product" && _id == $id][0]{ _id, stockQuantite }`,
              { id: item.product._id }
            );
            if (!p || p.stockQuantite == null) continue;
            const newQty = Math.max(0, p.stockQuantite - item.quantity);
            await writeClient
              .patch(p._id)
              .set({ stockQuantite: newQty, ...(newQty === 0 ? { enStock: false } : {}) })
              .commit();
          }
        } catch (e) {
          console.error("Sanity stock decrement error:", e);
        }
      })();
    }

    return NextResponse.json({ success: true, orderRef });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
