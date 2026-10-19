import { MAIL_FROM } from "@/lib/site";
import { consumeQuota } from "@/lib/rateLimit";

// Resend per REST-Aufruf — kein zusätzliches Paket nötig.
export type MailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type MailResult = { ok: true } | { ok: false; error: string };

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// Resend (kostenlos) erlaubt 100 Mails pro Tag. Mails, die durch Besucher:innen ausgelöst
// werden (Benachrichtigung, automatische Fragen), dürfen davon höchstens 60 verbrauchen –
// der Rest bleibt für Heike (Antworten, Fragen senden, Passwort vergessen).
// Ist das Limit erreicht, wird die Nachricht trotzdem gespeichert und im Admin angezeigt.
const PUBLIC_MAIL_DAILY_LIMIT = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function consumePublicMailQuota(): Promise<boolean> {
  const ok = await consumeQuota("mail:public-daily", PUBLIC_MAIL_DAILY_LIMIT, DAY_MS);
  if (!ok) console.error("Mail-Tageslimit für Formular-Mails erreicht – Mail wird übersprungen");
  return ok;
}

export async function sendMail(input: MailInput): Promise<MailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY fehlt" };

  // Testbetrieb: alle Mails an eine Adresse umlenken (TEST_EMAIL_REDIRECT).
  const redirect = process.env.TEST_EMAIL_REDIRECT;
  const to = redirect || input.to;
  const subject = redirect ? `[TEST → ${input.to}] ${input.subject}` : input.subject;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to,
        subject,
        text: input.text,
        html: input.html,
        reply_to: input.replyTo,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Resend-Fehler", res.status, detail.slice(0, 300));
      return { ok: false, error: `Resend ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("Resend nicht erreichbar", error);
    return { ok: false, error: "Resend nicht erreichbar" };
  }
}
