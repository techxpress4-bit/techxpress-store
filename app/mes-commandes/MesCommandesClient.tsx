"use client";

import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/types";
import { getItemPrice } from "@/lib/types";

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  en_attente: { label: "En attente de confirmation", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  confirmée:  { label: "Confirmée",   color: "#8b5fc0", bg: "rgba(107,63,160,0.12)" },
  expédiée:   { label: "Expédiée",    color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  livrée:     { label: "Livrée",      color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
  annulée:    { label: "Annulée",     color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
};

function StatusBadge({ statut }: { statut: OrderStatus }) {
  const cfg = statusConfig[statut] ?? statusConfig.en_attente;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-DZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function MesCommandesClient({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(107,63,160,0.1)", border: "1px solid rgba(107,63,160,0.2)" }}
          >
            <svg className="w-9 h-9" style={{ color: "var(--violet-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
            Aucune commande
          </h1>
          <p className="text-[#9ca3af] text-sm mb-8">
            Vous n&apos;avez pas encore passé de commande. Découvrez notre catalogue !
          </p>
          <Link href="/catalogue" className="btn-primary">
            Explorer le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--violet-light)" }}>
              Mon compte
            </p>
            <h1 className="section-title">Mes commandes</h1>
            <p className="text-[#9ca3af] text-sm mt-1">
              {orders.length} commande{orders.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/account" className="btn-secondary text-xs px-3 py-2">
            ← Mon compte
          </Link>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="card p-5"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-[#6b7280] mb-0.5">{formatDate(order.created_at)}</p>
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-syne)" }}>
                    {order.prenom} {order.nom}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-0.5 flex items-center gap-1.5">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {order.wilaya} — {order.telephone}
                  </p>
                </div>
                <StatusBadge statut={order.statut} />
              </div>

              {/* Items */}
              <div
                className="rounded-xl p-4 mb-4 space-y-2.5"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[#f5f5f5] text-xs font-medium line-clamp-1">
                        {item.product.nom}
                      </p>
                      {item.optionAbonnement && (
                        <p className="text-[#6b7280] text-xs mt-0.5">
                          {item.optionAbonnement === "box-abonnement" ? "Box + Abonnement TV" : "Box seule"}
                        </p>
                      )}
                      <p className="text-[#6b7280] text-xs">Qté : {item.quantity}</p>
                    </div>
                    <span className="text-white text-xs font-semibold flex-shrink-0">
                      {(getItemPrice(item) * item.quantity).toLocaleString("fr-DZ")} DA
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#6b7280] flex-1 min-w-0 truncate">
                  {order.adresse}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-xs text-[#9ca3af]">Total :</span>
                  <span className="price text-sm">
                    {order.total_price.toLocaleString("fr-DZ")}<span>DA</span>
                  </span>
                </div>
              </div>

              {/* Pending notice */}
              {order.statut === "en_attente" && (
                <div
                  className="mt-4 p-3 rounded-xl text-xs text-[#9ca3af] flex items-start gap-2"
                  style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Notre équipe vous contactera sous 24h pour confirmer et organiser la livraison.
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/catalogue" className="btn-secondary">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
