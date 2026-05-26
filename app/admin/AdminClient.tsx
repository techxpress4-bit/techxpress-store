"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const ADMIN_EMAILS = ["qlkdu33@gmail.com", "techxpress4@gmail.com"];

const STATUS_OPTIONS = [
  { value: "en_attente",   label: "En attente",    color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  { value: "confirmee",    label: "Confirmée",     color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  { value: "en_livraison", label: "En livraison",  color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  { value: "livree",       label: "Livrée",        color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
  { value: "annulee",      label: "Annulée",       color: "#f87171", bg: "rgba(248,113,113,0.1)" },
];

interface OrderItem {
  product?: { nom?: string; prix?: number; prixPromo?: number };
  quantity?: number;
  optionAbonnement?: string;
  variantNom?: string;
  variantPrix?: number;
}

interface Order {
  id: string;
  created_at: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string;
  adresse: string;
  wilaya: string;
  message?: string | null;
  total: number | null;
  total_price?: number | null;
  statut: string;
  items: OrderItem[];
}

export default function AdminClient() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        if (!data.user) {
          router.push("/login?next=/admin");
          return;
        }
        const email = (data.user.email || "").toLowerCase();
        if (!ADMIN_EMAILS.includes(email)) {
          if (active) {
            setForbidden(true);
            setLoading(false);
          }
          return;
        }
        const { data: rows, error } = await supabase
          .from("commandes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (active) {
          if (error) {
            toast.error("Erreur de chargement des commandes");
          } else {
            setOrders(rows ?? []);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleExpanded(orderId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  async function changeStatus(order: Order, newStatus: string) {
    if (newStatus === order.statut) return;
    setBusyId(order.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        toast.error("Session expirée. Reconnecte-toi.");
        return;
      }
      const res = await fetch("/api/admin/order-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: order.id, newStatus }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error || "Échec de la mise à jour");
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, statut: newStatus } : o))
      );
      toast.success(
        newStatus === order.statut
          ? "Statut inchangé"
          : `Statut: ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus}` +
            (data?.email?.skipped ? "" : " · email envoyé")
      );
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <p className="text-[#6b7280]">Chargement…</p>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
            Accès refusé
          </h1>
          <p className="text-sm text-[#9ca3af]">
            Cette page est réservée aux administrateurs TechXpress.
          </p>
        </div>
      </div>
    );
  }

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.statut === filter);

  const counts: Record<string, number> = { all: orders.length };
  STATUS_OPTIONS.forEach((s) => {
    counts[s.value] = orders.filter((o) => o.statut === s.value).length;
  });

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--violet-light)" }}>
            Admin
          </p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne)" }}>
            Commandes
          </h1>
          <p className="text-sm text-[#6b7280] mt-2">
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[{ value: "all", label: "Toutes", color: "#9ca3af", bg: "rgba(156,163,175,0.1)" }, ...STATUS_OPTIONS].map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap"
              style={
                filter === s.value
                  ? { background: s.bg, color: s.color, border: `1px solid ${s.color}40` }
                  : { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
              }
            >
              {s.label}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                {counts[s.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-sm text-[#6b7280]">Aucune commande dans ce filtre.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const statut = STATUS_OPTIONS.find((s) => s.value === order.statut) ?? STATUS_OPTIONS[0];
              const date = new Date(order.created_at).toLocaleString("fr-FR", {
                day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
              });
              const orderRef = String(order.id).slice(0, 8).toUpperCase();
              const itemCount = Array.isArray(order.items)
                ? order.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)
                : 0;
              const totalValue = Number(order.total ?? order.total_price ?? 0);
              const isExpanded = expanded.has(order.id);
              return (
                <div
                  key={order.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  {/* Header row */}
                  <div className="p-4 flex items-center gap-3 flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[10px] uppercase tracking-wider text-[#4b5563] font-semibold">
                          #{orderRef}
                        </p>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: statut.color, background: statut.bg }}
                        >
                          {statut.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">{date}</p>
                      <p className="text-sm font-semibold text-white mt-1">
                        {order.prenom} {order.nom} · {order.wilaya} · {itemCount} article{itemCount > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-[#9ca3af] mt-0.5">
                        {order.email} · {order.telephone}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <p className="text-base font-bold" style={{ color: "var(--violet-light)" }}>
                        {totalValue.toLocaleString("fr-DZ")} DA
                      </p>
                      <select
                        value={order.statut}
                        onChange={(e) => changeStatus(order, e.target.value)}
                        disabled={busyId === order.id}
                        className="px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                        style={{ background: "#111", color: "#fff", border: "1px solid var(--border)" }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => toggleExpanded(order.id)}
                        className="text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                        style={{ background: "var(--surface-2, #161616)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                      >
                        {isExpanded ? "Masquer" : "Détails"}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#1f1f1f] space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-2">Adresse</p>
                        <p className="text-sm text-[#f5f5f5] leading-relaxed whitespace-pre-line">
                          {order.adresse}
                        </p>
                      </div>
                      {order.message && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-2">Note du client</p>
                          <p className="text-sm text-[#f5f5f5] leading-relaxed whitespace-pre-line">
                            {order.message}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-2">Articles</p>
                        <div className="space-y-1.5">
                          {Array.isArray(order.items) && order.items.map((item, idx) => {
                            const qty = Number(item.quantity) || 1;
                            const isAbonnement = item.optionAbonnement === "box-abonnement";
                            const p = item.product || {};
                            const variantNom = item.variantNom;
                            const variantPrix = Number(item.variantPrix);
                            const promoActive = Number(p.prixPromo) > 0 && Number(p.prixPromo) < Number(p.prix);
                            const unit = variantPrix > 0
                              ? variantPrix
                              : promoActive
                              ? Number(p.prixPromo)
                              : Number(p.prix) || 0;
                            return (
                              <div key={idx} className="flex items-start justify-between gap-3 py-1.5 border-b border-[#1a1a1a] last:border-0">
                                <div>
                                  <p className="text-sm text-white">
                                    {p.nom ?? "Produit"}
                                    {variantNom && (
                                      <span className="ml-2 text-[11px] font-semibold" style={{ color: "var(--violet-light)" }}>
                                        — {variantNom}
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-[#6b7280] mt-0.5">
                                    Qté : {qty} · {unit.toLocaleString("fr-DZ")} DA/u
                                    {isAbonnement && " · avec abonnement TV"}
                                  </p>
                                </div>
                                <p className="text-sm text-[#9ca3af] flex-shrink-0">
                                  {(unit * qty).toLocaleString("fr-DZ")} DA
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
