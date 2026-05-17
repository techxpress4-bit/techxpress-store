"use client";

import { useState, useEffect } from "react";

type ConsentState = "pending" | "accepted" | "rejected";

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tx-cookie-consent") as ConsentState | null;
    if (stored) {
      setConsent(stored);
      if (stored === "accepted") loadAnalytics();
    } else {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const loadAnalytics = () => {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

    if (gaId && !(window as any)._gaLoaded) {
      const s = document.createElement("script");
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      s.async = true;
      document.head.appendChild(s);
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function () { (window as any).dataLayer.push(arguments); };
      (window as any).gtag("js", new Date());
      (window as any).gtag("config", gaId, { anonymize_ip: true });
      (window as any)._gaLoaded = true;
    }

    if (gtmId && !(window as any)._gtmLoaded) {
      const s = document.createElement("script");
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;
      document.head.appendChild(s);
      (window as any)._gtmLoaded = true;
    }
  };

  const accept = () => {
    localStorage.setItem("tx-cookie-consent", "accepted");
    setConsent("accepted");
    setVisible(false);
    loadAnalytics();
  };

  const reject = () => {
    localStorage.setItem("tx-cookie-consent", "rejected");
    setConsent("rejected");
    setVisible(false);
  };

  if (!visible || consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] p-4 md:p-6 animate-slide-up">
      <div
        className="max-w-4xl mx-auto rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/80"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(107,63,160,0.35)",
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: "var(--violet-light)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-syne)" }}>
                Nous utilisons des cookies
              </h3>
            </div>
            <p className="text-xs text-[#6b7280] leading-relaxed">
              Nous utilisons Google Analytics pour améliorer votre expérience.{" "}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="underline text-[#8b5fc0] hover:text-[#c084fc]"
              >
                {showDetails ? "Masquer" : "En savoir plus"}
              </button>
            </p>
            {showDetails && (
              <div className="mt-2 p-3 rounded-lg text-xs text-[#6b7280] leading-relaxed" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p><strong className="text-[#9ca3af]">Analytics (GA4 + GTM)&nbsp;:</strong> Mesure des visites et conversions. Adresses IP anonymisées.</p>
                <p className="mt-1">Aucune publicité ciblée. Aucune donnée vendue à des tiers.</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <button
              onClick={reject}
              className="btn-secondary text-xs py-2 px-4"
            >
              Refuser
            </button>
            <button
              onClick={accept}
              className="btn-primary text-xs py-2 px-4"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
