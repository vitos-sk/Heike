"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/components/admin/api";

const MIN = 8;

export default function AccountForm({
  initialEmail,
  adminLink,
}: {
  initialEmail: string;
  adminLink: string | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== initialEmail;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!currentPassword) {
      setMessage({ tone: "error", text: "Bitte gib zur Sicherheit dein aktuelles Passwort ein." });
      return;
    }
    if (!emailChanged && !newPassword) {
      setMessage({ tone: "error", text: "Es gibt nichts zu ändern." });
      return;
    }
    if (newPassword && newPassword.length < MIN) {
      setMessage({ tone: "error", text: `Das neue Passwort braucht mindestens ${MIN} Zeichen.` });
      return;
    }

    setBusy(true);
    try {
      await api("/api/admin/account", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          email: emailChanged ? email : undefined,
          newPassword: newPassword || undefined,
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setMessage({ tone: "ok", text: "Gespeichert." });
      router.refresh();
    } catch (err) {
      setMessage({ tone: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!adminLink) return;
    try {
      await navigator.clipboard.writeText(adminLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* Zwischenablage nicht verfügbar */
    }
  }

  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1 className="adm-h1">Zugang</h1>
        <p className="adm-sub">E-Mail und Passwort für deine Verwaltung.</p>
      </header>

      <form className="adm-card" onSubmit={submit} noValidate>
        <h2 className="adm-h3">Anmeldedaten ändern</h2>

        <label className="adm-lbl">
          E-Mail
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label className="adm-lbl">
          Neues Passwort <span className="adm-count">(leer lassen, wenn es gleich bleibt)</span>
          <span className="adm-pw">
            <input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={MIN}
            />
            <button type="button" className="adm-iconbtn" onClick={() => setShow((v) => !v)} aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}>
              {show ? <EyeOff className="ic" strokeWidth={1.6} aria-hidden="true" /> : <Eye className="ic" strokeWidth={1.6} aria-hidden="true" />}
            </button>
          </span>
          <span className="adm-hint">Mindestens {MIN} Zeichen.</span>
        </label>

        <label className="adm-lbl">
          Aktuelles Passwort <span className="adm-count">(zur Bestätigung)</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </label>

        {message && (
          <p className={message.tone === "ok" ? "adm-ok" : "adm-error"} role={message.tone === "ok" ? "status" : "alert"}>
            {message.tone === "ok" && <Check className="ic" strokeWidth={1.8} aria-hidden="true" />} {message.text}
          </p>
        )}

        <div>
          <button type="submit" className="btn" disabled={busy}>
            {busy && <Loader2 className="ic adm-spin" aria-hidden="true" />}
            Speichern
          </button>
        </div>
      </form>

      {adminLink && (
        <section className="adm-card">
          <h2 className="adm-h3">
            <ShieldCheck className="ic" strokeWidth={1.6} aria-hidden="true" /> Dein privater Link
          </h2>
          <p className="adm-muted">
            Ohne diesen Link ist die Verwaltung unsichtbar. Speichere ihn als Lesezeichen auf Handy und Computer – und gib ihn niemandem weiter.
          </p>
          <div className="adm-copy">
            <code>{adminLink}</code>
            <button type="button" className="btn btn--ghost" onClick={copy}>
              {copied ? <Check className="ic" strokeWidth={1.8} aria-hidden="true" /> : <Copy className="ic" strokeWidth={1.6} aria-hidden="true" />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
