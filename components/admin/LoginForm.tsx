"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/components/admin/api";

type Mode = "login" | "forgot" | "sent";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const safeNext = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      router.replace(safeNext);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function forgot(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setMode("sent");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="adm-auth">
      <div className="adm-auth-card">
        <Image src="/logo.png" alt="" width={788} height={771} sizes="5rem" priority className="logo" />

        {mode === "login" && (
          <form onSubmit={login} noValidate>
            <h1 className="adm-h1">Willkommen, Heike.</h1>
            <p className="adm-sub">Melde dich an, um deine Website zu verwalten.</p>

            <label className="adm-lbl">
              E-Mail
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            <label className="adm-lbl">
              Passwort
              <span className="adm-pw">
                <input
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="adm-iconbtn" onClick={() => setShow((v) => !v)} aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}>
                  {show ? <EyeOff className="ic" strokeWidth={1.6} aria-hidden="true" /> : <Eye className="ic" strokeWidth={1.6} aria-hidden="true" />}
                </button>
              </span>
            </label>

            {error && (
              <p className="adm-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn" disabled={busy || !email || !password}>
              {busy ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : null}
              Anmelden
              {!busy && <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />}
            </button>
            <button type="button" className="adm-linkbtn center" onClick={() => { setMode("forgot"); setError(null); }}>
              Passwort vergessen?
            </button>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={forgot} noValidate>
            <h1 className="adm-h1">Neues Passwort</h1>
            <p className="adm-sub">Wir schicken dir einen Link per E-Mail, mit dem du ein neues Passwort setzt.</p>
            <label className="adm-lbl">
              E-Mail
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
            {error && (
              <p className="adm-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy || !email}>
              {busy && <Loader2 className="ic adm-spin" aria-hidden="true" />}
              Link senden
            </button>
            <button type="button" className="adm-linkbtn center" onClick={() => { setMode("login"); setError(null); }}>
              Zurück zur Anmeldung
            </button>
          </form>
        )}

        {mode === "sent" && (
          <div>
            <h1 className="adm-h1">Schau in dein Postfach.</h1>
            <p className="adm-sub">
              Wenn die Adresse zu deinem Konto gehört, ist der Link unterwegs. Er gilt 30 Minuten.
            </p>
            <button type="button" className="adm-linkbtn center" onClick={() => setMode("login")}>
              Zurück zur Anmeldung
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
