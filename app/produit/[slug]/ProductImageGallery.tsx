"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import type { SanityImage } from "@/lib/types";

interface Props {
  images: SanityImage[];
  productName: string;
  enStock: boolean;
}

export default function ProductImageGallery({ images, productName, enStock }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#111] flex items-center justify-center" style={{ border: "1px solid var(--border)" }}>
        <svg className="w-24 h-24 text-[#2a2a2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const mainUrl = urlFor(images[activeIndex]).width(800).height(800).fit("crop").url();

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#111]" style={{ border: "1px solid var(--border)" }}>
        <Image
          src={mainUrl}
          alt={`${productName} ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-200"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Stock badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`badge-stock ${enStock ? "available" : "unavailable"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${enStock ? "bg-green-400" : "bg-red-400"}`} />
            {enStock ? "En stock" : "Rupture de stock"}
          </span>
        </div>

        {/* Arrow navigation — only if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,63,160,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(107,63,160,0.7)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Photo ${i + 1}`}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-200"
                  style={{ background: i === activeIndex ? "var(--violet-light)" : "rgba(255,255,255,0.35)", transform: i === activeIndex ? "scale(1.4)" : "scale(1)" }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, i) => {
            const thumbUrl = urlFor(img).width(160).height(160).fit("crop").url();
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Photo ${i + 1}`}
                className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  border: i === activeIndex ? "2px solid var(--violet)" : "1px solid var(--border)",
                  opacity: i === activeIndex ? 1 : 0.6,
                }}
              >
                <Image src={thumbUrl} alt={`${productName} ${i + 1}`} fill className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
