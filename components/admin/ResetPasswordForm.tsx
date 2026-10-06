"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { api } from "@/components/admin/api";

const MIN = 8;

export default function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN) return setError(`Das Passwort braucht mindestens ${MIN} Zeichen.`);
    if (password !== repeat) return setError("Die beiden Passwörter sind nicht gleich.");

    setBusy(true);
    try {
      await api("/api/admin/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
      setDone(true);
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

        {done ? (
          <div>
            <h1 className="adm-h1">Fertig.</h1>
            <p className="adm-sub">Dein neues Passwort ist gespeichert.</p>
            <p className="adm-ok">
              <Check className="ic" strokeWidth={1.8} aria-hidden="true" /> Du kannst dich jetzt anmelden.
            </p>
            <Link href="/admin/login" className="btn">
              Zur Anmeldung
            </Link>
          </div>
        ) : !token ? (
          <div>
            <h1 className="adm-h1">Link ungültig.</h1>
            <p className="adm-sub">Bitte fordere auf der Anmeldeseite einen neuen Link an.</p>
            <Link href="/admin/login" className="btn">
              Zur Anmeldung
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h1 className="adm-h1">Neues Passwort</h1>
            <p className="adm-sub">Wähle ein Passwort mit mindestens {MIN} Zeichen.</p>
            <label className="adm-lbl">
              Neues Passwort
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            </label>
            <label className="adm-lbl">
              Noch einmal
              <input type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} required />
            </label>
            {error && (
              <p className="adm-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn" disabled={busy || !password}>
              {busy && <Loader2 className="ic adm-spin" aria-hidden="true" />}
              Passwort speichern
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
