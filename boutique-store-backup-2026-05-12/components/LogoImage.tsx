"use client";

import Image from "next/image";
import { useState } from "react";

interface LogoImageProps {
  className?: string;
  size?: number;
}

function TxMonogram() {
  return (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <rect width="40" height="40" rx="8" fill="#111" />
      <text x="4" y="30" fontSize="24" fontWeight="800" fontFamily="var(--font-syne), sans-serif" fill="#006233">T</text>
      <text x="18" y="30" fontSize="24" fontWeight="800" fontFamily="var(--font-syne), sans-serif" fill="#D21034">X</text>
    </svg>
  );
}

export default function LogoImage({ className = "w-10 h-10" }: LogoImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return <div className={className}><TxMonogram /></div>;

  return (
    <div className={`relative ${className}`}>
      <Image
        src="/logo.png"
        alt="Tech Xpress"
        fill
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export { TxMonogram };
