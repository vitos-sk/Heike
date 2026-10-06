"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Facebook, Instagram, Mail, Phone, Send } from "lucide-react";
import { contact } from "@/lib/placeholder-data";
import { HONEYPOT_FIELD } from "@/lib/honeypot";

type Field = "name" | "email" | "msg" | "consent";
type Errors = Partial<Record<Field, string>>;

const MESSAGES: Record<Field, string> = {
  name: "Bitte sag mir, wie du heißt.",
  email: "Bitte gib eine gültige E-Mail-Adresse an.",
  msg: "Schreib mir gern ein paar Worte.",
  consent: "Bitte bestätige die Datenschutzerklärung.",
};

const telHref = `tel:+49${contact.phone.replace(/^0/, "").replace(/\s/g, "")}`;

export const WANT_QUESTIONS_EVENT = "heike:want-questions";

export default function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [wantsQuestions, setWantsQuestions] = useState(false);
  const [sentWithQuestions, setSentWithQuestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Der Button „Hol dir deine 7 Reflexionsfragen“ kreuzt die Option im Formular an.
  useEffect(() => {
    const on = () => setWantsQuestions(true);
    window.addEventListener(WANT_QUESTIONS_EVENT, on);
    return () => window.removeEventListener(WANT_QUESTIONS_EVENT, on);
  }, []);

  const clear = (field: Field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const msg = String(data.get("msg") ?? "").trim();
    const consent = data.get("consent") === "on";

    const next: Errors = {};
    if (!name) next.name = MESSAGES.name;
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = MESSAGES.email;
    if (!msg) next.msg = MESSAGES.msg;
    if (!consent) next.consent = MESSAGES.consent;
    setErrors(next);
    if (Object.keys(next).length) {
      const first = (Object.keys(next) as Field[])[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: msg,
          consent: true,
          wantsQuestions,
          [HONEYPOT_FIELD]: String(data.get(HONEYPOT_FIELD) ?? ""),
        }),
      });
      const result = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setServerError(
          result.error ??
            `Das hat leider nicht geklappt. Bitte versuche es noch einmal oder schreib mir direkt an ${contact.email}.`,
        );
        return;
      }
      setSentWithQuestions(wantsQuestions);
      setDone(true);
    } catch {
      setServerError(
        `Keine Verbindung. Bitte versuche es noch einmal oder schreib mir direkt an ${contact.email}.`,
      );
    } finally {
      setSending(false);
    }
  }

  const inv = (f: Field) => (errors[f] ? "true" : undefined);

  return (
    <section id="contact" className="ct" aria-labelledby="ct-h">
      <div className="ct-panel">
        <div className="ct-inner">
          <div className="ct-head">
            <h2 className="t-h2 rv" id="ct-h">
              {contact.heading}
            </h2>
            <p className="t-lead rv">{contact.subheading}</p>
          </div>

          {done ? (
            <div className="thanks" role="status">
              <span className="ok">
                <Check className="ic" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h3 className="t-h3">Danke dir!</h3>
              <p className="t-body">
                Deine Nachricht ist angekommen. Ich melde mich persönlich bei dir.
                {sentWithQuestions && " Deine Reflexionsfragen bekommst du per E-Mail."}
              </p>
            </div>
          ) : (
            <form className="ct-form" noValidate onSubmit={onSubmit} ref={formRef}>
              <div>
                <p className="sent">
                  Hallo Heike, ich bin{" "}
                  <input
                    name="name"
                    autoComplete="name"
                    aria-label={contact.form.nameLabel}
                    placeholder="dein Name"
                    aria-invalid={inv("name")}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    onInput={() => clear("name")}
                  />{" "}
                  und du erreichst mich unter{" "}
                  <input
                    className="w"
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-label={contact.form.emailLabel}
                    placeholder="deine@email.de"
                    aria-invalid={inv("email")}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    onInput={() => clear("email")}
                  />
                  .
                </p>
                {errors.name && (
                  <p className="ct-err" id="err-name">
                    {errors.name}
                  </p>
                )}
                {errors.email && (
                  <p className="ct-err" id="err-email">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <p className="sent">
                  <label htmlFor="ct-msg">Ich möchte dir schreiben:</label>
                  <textarea
                    id="ct-msg"
                    name="msg"
                    aria-label={contact.form.messageLabel}
                    placeholder="Was bewegt dich gerade?"
                    aria-invalid={inv("msg")}
                    aria-describedby={errors.msg ? "err-msg" : undefined}
                    onInput={() => clear("msg")}
                  />
                </p>
                {errors.msg && (
                  <p className="ct-err" id="err-msg">
                    {errors.msg}
                  </p>
                )}
              </div>

              <input
                type="text"
                name={HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hp"
                defaultValue=""
              />

              <label className="chk">
                <input
                  type="checkbox"
                  name="wantsQuestions"
                  checked={wantsQuestions}
                  onChange={(e) => setWantsQuestions(e.target.checked)}
                />
                <span>Ich möchte außerdem die 7 Reflexionsfragen per E-Mail erhalten.</span>
              </label>

              <div>
                <label className="chk">
                  <input
                    type="checkbox"
                    name="consent"
                    aria-invalid={inv("consent")}
                    aria-describedby={errors.consent ? "err-consent" : undefined}
                    onChange={() => clear("consent")}
                  />
                  <span>
                    Ich habe die{" "}
                    <Link className="tlink" href="/datenschutz">
                      Datenschutzerklärung
                    </Link>{" "}
                    gelesen und bin einverstanden.
                  </span>
                </label>
                {errors.consent && (
                  <p className="ct-err" id="err-consent">
                    {errors.consent}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="ct-err" role="alert">
                  {serverError}
                </p>
              )}

              <div>
                <button className="btn" type="submit" disabled={sending}>
                  {sending ? "Wird gesendet …" : contact.form.submitLabel}
                  {!sending && <Send className="ic" strokeWidth={1.6} aria-hidden="true" />}
                </button>
              </div>
            </form>
          )}

          <div className="ct-chips">
            <a href={telHref}>
              <Phone className="ic" strokeWidth={1.6} aria-hidden="true" />
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`}>
              <Mail className="ic" strokeWidth={1.6} aria-hidden="true" />
              {contact.email}
            </a>
            {contact.social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label === "Instagram" ? (
                  <Instagram className="ic" strokeWidth={1.6} aria-hidden="true" />
                ) : (
                  <Facebook className="ic" strokeWidth={1.6} aria-hidden="true" />
                )}
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
