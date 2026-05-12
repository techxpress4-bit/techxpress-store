"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/lib/types";

interface Props {
  images: SanityImage[];
  nom: string;
  enStock: boolean;
}

export default function ProductGallery({ images, nom, enStock }: Props) {
  const [active, setActive] = useState(0);

  const prev = useCallback(() =>
    setActive((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() =>
    setActive((i) => (i + 1) % images.length), [images.length]);

  const mainUrl = images[active]
    ? urlFor(images[active]).width(800).height(800).fit("crop").url()
    : null;

  return (
    <div className="space-y-3">

      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-[#111]"
        style={{ border: "1px solid var(--border)" }}
      >
        {mainUrl ? (
          <Image
            key={active}
            src={mainUrl}
            alt={`${nom} — photo ${active + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            priority={active === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-24 h-24 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-4 left-4">
          <span className={`badge-stock ${enStock ? "available" : "unavailable"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${enStock ? "bg-green-400" : "bg-red-400"}`} />
            {enStock ? "En stock" : "Rupture de stock"}
          </span>
        </div>

        {/* Navigation arrows — only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Counter */}
            <div
              className="absolute bottom-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
            >
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => {
            const thumbUrl = urlFor(img).width(160).height(160).fit("crop").url();
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                className="relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 hover:opacity-90"
                style={{
                  border: i === active
                    ? "2px solid var(--violet)"
                    : "1px solid var(--border)",
                  opacity: i === active ? 1 : 0.6,
                }}
                aria-label={`Voir photo ${i + 1}`}
              >
                <Image src={thumbUrl} alt={`${nom} ${i + 1}`} fill className="object-cover" />
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
