import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import type { CartItem } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

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
}): { subject: string; html: string } {
  if (data.type === "contact") {
    return {
      subject: `[Contact] Message de ${data.nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6B3FA0, #4E2D7A); padding: 24px;">
            <h1 style="margin: 0; color: white; font-size: 24px;">Nouveau message — Tech Xpress</h1>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #9ca3af; width: 120px;">Nom :</td><td style="color: #f5f5f5;">${data.nom || "-"}</td></tr>
              <tr><td style="padding: 8px 0; color: #9ca3af;">Téléphone :</td><td style="color: #f5f5f5;">${data.telephone}</td></tr>
              <tr><td style="padding: 8px 0; color: #9ca3af;">Email :</td><td style="color: #f5f5f5;">${data.email || "-"}</td></tr>
            </table>
            <div style="margin-top: 16px; padding: 16px; background: #161616; border-radius: 8px; border-left: 3px solid #6B3FA0;">
              <p style="margin: 0; color: #f5f5f5;">${data.message || "-"}</p>
            </div>
          </div>
        </div>`,
    };
  }

  const itemsHtml =
    data.items
      ?.map(
        (item) => `
      <tr style="border-bottom: 1px solid #2a2a2a;">
        <td style="padding: 10px 0; color: #f5f5f5;">${item.product.nom}${item.optionAbonnement ? `<br><small style="color:#9ca3af;">${item.optionAbonnement === "box-abonnement" ? "Box + Abonnement TV" : "Box seule"}</small>` : ""}</td>
        <td style="padding: 10px 0; color: #9ca3af; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 0; color: #f5f5f5; text-align: right; font-weight: bold;">${(item.product.prix * item.quantity).toLocaleString("fr-DZ")} DA</td>
      </tr>`
      )
      .join("") || "";

  return {
    subject: `🛍️ Nouvelle commande — ${data.prenom} ${data.nom}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6B3FA0, #4E2D7A); padding: 24px 24px 20px;">
          <h1 style="margin: 0 0 4px; color: white; font-size: 22px;">Nouvelle commande</h1>
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px;">Tech Xpress — Paiement à la livraison</p>
        </div>

        <div style="padding: 24px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8b5fc0; margin: 0 0 12px;">Client</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 6px 0; color: #9ca3af; width: 130px;">Nom :</td><td style="color: #f5f5f5; font-weight: bold;">${data.prenom} ${data.nom}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Téléphone :</td><td style="color: #f5f5f5; font-weight: bold; font-size: 16px;">${data.telephone}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Wilaya :</td><td style="color: #f5f5f5;">${data.wilaya}</td></tr>
            <tr><td style="padding: 6px 0; color: #9ca3af;">Adresse :</td><td style="color: #f5f5f5;">${data.adresse}</td></tr>
            ${data.message ? `<tr><td style="padding: 6px 0; color: #9ca3af;">Message :</td><td style="color: #f5f5f5; font-style: italic;">${data.message}</td></tr>` : ""}
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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const to = process.env.RESEND_TO_EMAIL;

    if (!to) {
      return NextResponse.json({ error: "Email destination non configuré" }, { status: 500 });
    }

    const { subject, html } = formatOrderEmail(data);

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
