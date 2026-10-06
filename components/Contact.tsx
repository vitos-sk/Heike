"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Facebook, Instagram, Mail, Phone, Send } from "lucide-react";
import { contact } from "@/lib/placeholder-data";

type Field = "name" | "email" | "msg" | "consent";
type Errors = Partial<Record<Field, string>>;

const MESSAGES: Record<Field, string> = {
  name: "Bitte sag mir, wie du heißt.",
  email: "Bitte gib eine gültige E-Mail-Adresse an.",
  msg: "Schreib mir gern ein paar Worte.",
  consent: "Bitte bestätige die Datenschutzerklärung.",
};

const telHref = `tel:+49${contact.phone.replace(/^0/, "").replace(/\s/g, "")}`;

export default function Contact() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const clear = (field: Field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
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
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    // TODO: Versand anbinden (mailto / Resend / Formspree) – wartet auf Entscheidung.
    // Aktuell wird NICHTS gesendet; nur die Bestätigung wird angezeigt.
    setDone(true);
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
              </p>
            </div>
          ) : (
            <form className="ct-form" noValidate onSubmit={onSubmit}>
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

              <div>
                <button className="btn" type="submit">
                  {contact.form.submitLabel}
                  <Send className="ic" strokeWidth={1.6} aria-hidden="true" />
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
