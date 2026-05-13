"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

type Tab = "login" | "register";

export default function LoginClient() {
  const router = useRouter();
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Login state
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [remember, setRemember] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [newsletter, setNewsletter] = useState(true);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.identifier,
        password: loginData.password,
      });
      if (error) throw error;
      toast.success("Connecté !");
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      toast.error(msg === "Invalid login credentials" ? "Identifiants incorrects" : msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) throw error;
      toast.success("Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.");
      setForgotMode(false);
      setResetEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (registerData.password !== registerData.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            prenom: registerData.prenom,
            nom: registerData.nom,
            telephone: registerData.telephone,
            newsletter_opt_in: newsletter,
          },
        },
      });
      if (error) throw error;
      if (data.user && !data.session) {
        toast.success("Vérifiez votre email pour confirmer votre compte !");
        setTab("login");
      } else {
        toast.success("Compte créé !");
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la création";
      toast.error(msg.includes("already registered") ? "Cet email est déjà utilisé" : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <span
              className="text-2xl font-extrabold"
              style={{ fontFamily: "var(--font-syne)", letterSpacing: "-0.02em" }}
            >
              Tech<span style={{ color: "var(--violet)" }}>XpressDZ</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid rgba(107,63,160,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Tabs */}
          <div className="flex border-b border-[#2a2a2a]">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${
                  tab === t
                    ? "text-white border-b-2 border-[#6b3fa0] bg-[rgba(107,63,160,0.08)]"
                    : "text-[#6b7280] hover:text-[#9ca3af]"
                }`}
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {t === "login" ? "Se connecter" : "Créer un compte"}
              </button>
            ))}
          </div>

          <div className="p-8">
            {tab === "login" && forgotMode ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-base font-bold text-white mb-1" style={{ fontFamily: "var(--font-syne)" }}>
                    Mot de passe oublié
                  </h2>
                  <p className="text-xs text-[#6b7280]">
                    Entrez votre adresse email pour recevoir un lien de réinitialisation.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input-field"
                    autoComplete="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="w-full text-center text-xs text-[#6b7280] hover:text-[#9ca3af] transition-colors py-1"
                >
                  ← Retour à la connexion
                </button>
              </form>
            ) : tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold text-[#f5f5f5] transition-all hover:bg-[#2a2a2a]"
                  style={{ border: "1px solid #2a2a2a", background: "#161616" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>

                <div className="flex items-center gap-3 text-xs text-[#4b5563]">
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                  ou
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input-field"
                    autoComplete="email"
                    required
                    value={loginData.identifier}
                    onChange={(e) => setLoginData((p) => ({ ...p, identifier: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    autoComplete="current-password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-[#6b7280] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded accent-[#6b3fa0]"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Se souvenir de moi
                  </label>
                  <button
                    type="button"
                    onClick={() => { setResetEmail(loginData.identifier); setForgotMode(true); }}
                    className="text-[#8b5fc0] hover:text-[#c084fc] transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2"
                >
                  {loading ? "Connexion…" : "Se connecter"}
                </button>

                <p className="text-center text-xs text-[#6b7280] pt-2">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("register")}
                    className="text-[#8b5fc0] hover:text-[#c084fc] transition-colors font-medium"
                  >
                    Créer un compte
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl text-sm font-semibold text-[#f5f5f5] transition-all hover:bg-[#2a2a2a]"
                  style={{ border: "1px solid #2a2a2a", background: "#161616" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuer avec Google
                </button>

                <div className="flex items-center gap-3 text-xs text-[#4b5563]">
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                  ou
                  <div className="flex-1 h-px bg-[#2a2a2a]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      className="input-field"
                      autoComplete="given-name"
                      required
                      value={registerData.prenom}
                      onChange={(e) => setRegisterData((p) => ({ ...p, prenom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Nom *</label>
                    <input
                      type="text"
                      placeholder="Nom"
                      className="input-field"
                      autoComplete="family-name"
                      required
                      value={registerData.nom}
                      onChange={(e) => setRegisterData((p) => ({ ...p, nom: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Téléphone *</label>
                  <input
                    type="tel"
                    placeholder="05 XX XX XX XX"
                    className="input-field"
                    autoComplete="tel"
                    required
                    value={registerData.telephone}
                    onChange={(e) => setRegisterData((p) => ({ ...p, telephone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Email *</label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input-field"
                    autoComplete="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Mot de passe *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    autoComplete="new-password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input-field"
                    autoComplete="new-password"
                    required
                    value={registerData.confirm}
                    onChange={(e) => setRegisterData((p) => ({ ...p, confirm: e.target.value }))}
                  />
                </div>

                <label
                  className="flex items-start gap-3 p-3 rounded-xl cursor-pointer select-none transition-colors hover:bg-[#1a1a1a]"
                  style={{ border: "1px solid #2a2a2a" }}
                >
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    className="mt-0.5 flex-shrink-0 accent-[#6b3fa0]"
                  />
                  <span className="text-xs text-[#9ca3af] leading-relaxed">
                    Je souhaite recevoir les offres exclusives, promotions et nouveautés de{" "}
                    <span className="text-[#c084fc] font-medium">TechXpress</span> par email.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2"
                >
                  {loading ? "Création…" : "Créer mon compte"}
                </button>

                <p className="text-center text-xs text-[#6b7280] pt-2">
                  Déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className="text-[#8b5fc0] hover:text-[#c084fc] transition-colors font-medium"
                  >
                    Se connecter
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Admin access */}
        <div className="mt-4 text-center">
          <Link
            href="/studio"
            className="text-xs text-[#4b5563] hover:text-[#6b7280] transition-colors"
          >
            Accès administration →
          </Link>
        </div>
      </div>
    </div>
  );
}
