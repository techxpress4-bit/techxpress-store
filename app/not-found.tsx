import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16 pb-20 px-4">
      <div className="text-center max-w-md">
        <p
          className="text-8xl font-black mb-6 leading-none"
          style={{
            background: "linear-gradient(135deg, var(--violet-light) 0%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "var(--font-syne)",
          }}
        >
          404
        </p>
        <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-syne)" }}>
          Page introuvable
        </h1>
        <p className="text-[#9ca3af] text-sm mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/catalogue" className="btn-secondary">
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
