import type { NextRequest } from "next/server";
import { HONEYPOT_FIELD } from "@/lib/honeypot";
import { consumeQuota, getClientIp } from "@/lib/rateLimit";
import { CONTACT_EMAIL } from "@/lib/site";

// Schutz des öffentlichen Kontaktformulars gegen Bots und Massenversand.
const HOUR_MS = 60 * 60 * 1000;

// Pro Absender 20/Stunde — großzügig, denn hinter einer IP stehen oft viele Menschen
// (Mobilfunk, Büro, Hotel-WLAN). Eine verlorene echte Anfrage wiegt schwerer.
const PER_IP_LIMIT = 20;
// Notbremse für die ganze Seite gegen verteilte Angriffe.
const GLOBAL_LIMIT = 25;

export const FIELD_LIMITS = { name: 120, email: 200, message: 5000 } as const;

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Body einlesen, ohne dass kaputtes JSON die Route mit einem 500er beendet.
export async function readJsonBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  const value = body[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}

export type GuardResult = { ok: true } | { ok: false; status: number; error: string };

const TOO_MANY = {
  ok: false as const,
  status: 429,
  error:
    "Das Formular wurde von hier aus gerade sehr oft abgeschickt. " +
    `Bitte versuche es in einer Stunde noch einmal – oder schreib direkt an ${CONTACT_EMAIL}.`,
};

export async function guardPublicForm(
  request: NextRequest,
  body: Record<string, unknown>,
): Promise<GuardResult> {
  if (isHoneypotFilled(body)) {
    // Bots bekommen keinen Hinweis, dass sie erkannt wurden.
    return { ok: false, status: 200, error: "" };
  }

  const ip = getClientIp(request);
  if (!(await consumeQuota(`ip:${ip}`, PER_IP_LIMIT, HOUR_MS))) return TOO_MANY;
  if (!(await consumeQuota("global", GLOBAL_LIMIT, HOUR_MS))) return TOO_MANY;

  return { ok: true };
}
