import Link from "next/link";
import { Suspense } from "react";
import { sanityFetch } from "@/lib/sanity";
import { featuredProductsQuery, allCategoriesQuery } from "@/lib/queries";
import type { Product, Category } from "@/lib/types";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductCarousel from "@/components/ProductCarousel";
import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

async function CategoriesSection() {
  let categories: Category[] = [];
  try {
    categories = await sanityFetch<Category[]>(allCategoriesQuery);
  } catch {
    return null;
  }
  if (!categories || categories.length === 0) return null;
  return <CategoryCarousel categories={categories} />;
}

async function BestSellersSection() {
  let featured: Product[] = [];
  try {
    featured = await sanityFetch<Product[]>(featuredProductsQuery);
  } catch {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <p className="text-center text-[#6b7280] py-10">
          Impossible de charger les produits. Réessayez dans un instant.
        </p>
      </div>
    );
  }
  if (!featured || featured.length === 0) return null;
  return <ProductCarousel products={featured} />;
}

export default async function HomePage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "";

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(107,63,160,0.5) 40px, rgba(107,63,160,0.5) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(107,63,160,0.5) 40px, rgba(107,63,160,0.5) 41px)",
          }}
        />

        {/* Glow orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--violet)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: "#8b5fc0" }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in" style={{ background: "rgba(107,63,160,0.15)", border: "1px solid rgba(107,63,160,0.4)", color: "#c084fc" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] animate-pulse" />
            Livraison dans les 58 wilayas d&apos;Algérie
          </div>

          {/* Brand title */}
          <div className="mb-4">
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none"
              style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.04em" }}
            >
              <span className="text-white">Tech</span>
              <span style={{
                background: "linear-gradient(135deg, #8b5fc0 0%, #c084fc 50%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Xpress</span>
            </span>
          </div>

          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#d1d5db] mb-6"
            style={{ fontFamily: "var(--font-syne)", lineHeight: 1.2 }}
          >
            Votre destination{" "}
            <span className="gradient-text">tech</span>
            {" "}en Algérie
          </h1>

          <p className="text-lg md:text-xl text-[#9ca3af] mb-10 max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
            Box TV Android, accessoires, câbles, routeurs et plus.
            <br />
            <strong className="text-[#f5f5f5]">Paiement à la livraison</strong> — commandez en ligne, payez à la réception.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/catalogue" className="btn-primary text-base px-8 py-4">
              Explorer le catalogue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-8 py-4"
              >
                <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Nous contacter
              </a>
            )}
          </div>

          {/* Features strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
            {[
              {
                svg: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                ),
                color: "#6b3fa0",
                glow: "rgba(107,63,160,0.25)",
                title: "Livraison nationale",
                desc: "58 wilayas d'Algérie",
              },
              {
                svg: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                ),
                color: "#006233",
                glow: "rgba(0,98,51,0.25)",
                title: "Paiement à la livraison",
                desc: "Aucune carte requise",
              },
              {
                svg: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                color: "#8b5fc0",
                glow: "rgba(139,95,192,0.25)",
                title: "Produits garantis",
                desc: "Qualité vérifiée",
              },
              {
                svg: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                ),
                color: "#D21034",
                glow: "rgba(210,16,52,0.2)",
                title: "Support client",
                desc: "WhatsApp & téléphone",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="relative rounded-2xl p-6 lg:p-7 text-left overflow-hidden group"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Glow corner */}
                <div
                  className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: f.color, transform: "translate(30%, -30%)" }}
                />
                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />
                {/* Icon */}
                <div
                  className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center mb-5 flex-shrink-0"
                  style={{
                    background: `rgba(${f.color === "#006233" ? "0,98,51" : f.color === "#D21034" ? "210,16,52" : f.color === "#6b3fa0" ? "107,63,160" : "139,95,192"},0.15)`,
                    border: `1px solid ${f.color}35`,
                    color: f.color,
                    boxShadow: `0 4px 20px ${f.glow}`,
                  }}
                >
                  <div className="w-6 h-6 lg:w-7 lg:h-7">{f.svg}</div>
                </div>
                <p className="text-base font-bold text-white leading-snug mb-1.5" style={{ fontFamily: "var(--font-syne)" }}>
                  {f.title}
                </p>
                <p className="text-sm text-[#6b7280]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories carousel */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl flex-shrink-0" style={{ width: 160, height: 120 }} />
            ))}
          </div>
        </div>
      }>
        <CategoriesSection />
      </Suspense>

      {/* Best Sellers carousel */}
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <ProductGridSkeleton count={8} />
        </div>
      }>
        <BestSellersSection />
      </Suspense>

      {/* WhatsApp CTA */}
      {whatsapp && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div
            className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(107,63,160,0.12) 0%, rgba(107,63,160,0.04) 100%)",
              border: "1px solid rgba(107,63,160,0.25)",
            }}
          >
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, var(--violet) 0%, transparent 50%), radial-gradient(circle at 70% 50%, #8b5fc0 0%, transparent 50%)" }} />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 8px 30px rgba(37,211,102,0.3)" }}>
                <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
                Une question ? On est là.
              </h2>
              <p className="text-[#9ca3af] mb-8 max-w-lg mx-auto">
                Contactez-nous sur WhatsApp pour un conseil personnalisé, des infos sur la disponibilité ou pour finaliser votre commande.
              </p>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 4px 20px rgba(37,211,102,0.35)" }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ouvrir WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
