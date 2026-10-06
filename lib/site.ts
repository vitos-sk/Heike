import { contact } from "@/lib/placeholder-data";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Heike Schaub";

export const CONTACT_EMAIL = contact.email;

// Absender aller Mails. Resend verschickt nur über eine dort verifizierte Domain;
// Antworten landen dank Reply-To trotzdem im Postfach von Heike.
export const MAIL_FROM = process.env.CONTACT_EMAIL_FROM ?? `Heike Schaub <onboarding@resend.dev>`;
export const MAIL_TO = process.env.CONTACT_EMAIL_TO ?? CONTACT_EMAIL;
