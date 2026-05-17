"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const next = params.get("next") || "/";

    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code)
        .then(() => {
          router.push(next);
          router.refresh();
        })
        .catch(() => router.push("/"));
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#9ca3af]">Connexion en cours…</p>
    </div>
  );
}
