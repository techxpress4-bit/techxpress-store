import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Commande confirmée",
};

export default function ConfirmationPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        {/* Success animation */}
        <div className="relative mb-8 mx-auto w-fit">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-pulse-glow"
            style={{
              background: "linear-gradient(135deg, rgba(107,63,160,0.3), rgba(107,63,160,0.1))",
              border: "2px solid rgba(107,63,160,0.5)",
            }}
          >
            <svg
              className="w-12 h-12"
              style={{ color: "var(--violet-light)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1
          className="text-3xl md:text-4xl font-extrabold text-white mb-4"
          style={{ fontFamily: "var(--font-syne)" }}
        >
          Commande reçue !
        </h1>

        <div
          className="p-5 rounded-2xl mb-8 text-left"
          style={{
            background: "rgba(107,63,160,0.08)",
            border: "1px solid rgba(107,63,160,0.25)",
          }}
        >
          <p className="text-[#f5f5f5] text-sm leading-relaxed">
            Votre commande a bien été reçue. Notre équipe vous contactera sous{" "}
            <strong className="text-white">24h</strong> pour confirmer et organiser la livraison.
          </p>
          <div className="mt-4 space-y-2">
            {[
              { step: "1", text: "Confirmation par téléphone sous 24h" },
              { step: "2", text: "Expédition selon votre wilaya" },
              { step: "3", text: "Paiement à la réception" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-3 text-sm text-[#9ca3af]">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "var(--violet)" }}
                >
                  {s.step}
                </span>
                {s.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary px-8">
            Retour à l&apos;accueil
          </Link>
          <Link href="/catalogue" className="btn-secondary px-8">
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  );
}
