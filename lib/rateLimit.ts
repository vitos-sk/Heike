import { createHash } from "node:crypto";
import { getDb } from "@/lib/supabase";

// Zähler liegen in Postgres (Funktionen rl_hit / rl_peek) und nicht im Arbeitsspeicher:
// Auf Vercel laufen mehrere Instanzen parallel und werden ständig neu gestartet.
// Fällt die Datenbank aus, lassen wir Anfragen bewusst durch — ein kaputtes
// Kontaktformular wäre schlimmer als ein paar ungebremste Anfragen.

// Wer gesperrt ist, merken wir uns kurz im Speicher der Instanz: ein laufender
// Angriff kostet dann keine Datenbankzugriffe mehr.
const blockedUntil = new Map<string, number>();

// Der Schlüssel (meist eine IP) wird nur als Hash gespeichert.
function bucketId(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

async function hit(key: string, windowMs: number): Promise<number> {
  const { data, error } = await getDb().rpc("rl_hit", {
    p_key: bucketId(key),
    p_window_ms: windowMs,
  });
  if (error) throw error;
  return typeof data === "number" ? data : 0;
}

/** Ein Kontingent verbrauchen. Gibt false zurück, wenn das Limit erreicht ist. */
export async function consumeQuota(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const blocked = blockedUntil.get(key);
  if (blocked !== undefined) {
    if (blocked > now) return false;
    blockedUntil.delete(key);
  }

  try {
    const count = await hit(key, windowMs);
    if (count > limit) {
      blockedUntil.set(key, now + Math.min(windowMs, 60_000));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Rate-Limit: Datenbank nicht erreichbar, Anfrage wird durchgelassen", error);
    return true;
  }
}

/** Prüft nur, ob ein Schlüssel gesperrt ist — ohne etwas zu verbrauchen (Login). */
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const blocked = blockedUntil.get(key);
  if (blocked !== undefined) {
    if (blocked > now) return true;
    blockedUntil.delete(key);
  }

  try {
    const { data, error } = await getDb().rpc("rl_peek", {
      p_key: bucketId(key),
      p_window_ms: windowMs,
    });
    if (error) throw error;
    const count = typeof data === "number" ? data : 0;
    if (count >= limit) {
      blockedUntil.set(key, now + Math.min(windowMs, 60_000));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Rate-Limit: Datenbank nicht erreichbar, Versuch wird durchgelassen", error);
    return false;
  }
}

/** Einen Fehlversuch zählen. */
export async function recordFailure(key: string, windowMs: number): Promise<void> {
  try {
    await hit(key, windowMs);
  } catch (error) {
    console.error("Rate-Limit: Fehlversuch konnte nicht gezählt werden", error);
  }
}

/** Nach erfolgreicher Anmeldung: Zähler zurücksetzen. */
export async function clearFailures(key: string): Promise<void> {
  blockedUntil.delete(key);
  try {
    await getDb().from("rate_limits").delete().eq("key", bucketId(key));
  } catch (error) {
    console.error("Rate-Limit: Zähler konnte nicht zurückgesetzt werden", error);
  }
}

/** IP der Anfrage — hinter dem Vercel-Proxy steht sie im x-forwarded-for. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
