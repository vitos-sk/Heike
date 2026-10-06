import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/adminAccount";
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";
import { clearFailures, getClientIp, isRateLimited, recordFailure } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Gezählt werden nur Fehlversuche; nach erfolgreicher Anmeldung wird der Zähler gelöscht,
// sonst sperrt man sich mit fünf normalen Anmeldungen selbst aus.
export async function POST(request: Request) {
  const key = `admin-login:${getClientIp(request)}`;

  if (await isRateLimited(key, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte in 15 Minuten erneut versuchen." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = (body as { email?: unknown } | null)?.email;
  const password = (body as { password?: unknown } | null)?.password;

  let ok = false;
  if (typeof email === "string" && typeof password === "string" && email && password) {
    try {
      ok = await verifyCredentials(email, password);
    } catch (error) {
      console.error("Admin-Login fehlgeschlagen:", error);
      return NextResponse.json(
        { error: "Anmeldung derzeit nicht möglich. Bitte später erneut versuchen." },
        { status: 500 },
      );
    }
  }

  if (!ok) {
    await recordFailure(key, WINDOW_MS);
    // Keine Unterscheidung zwischen falscher E-Mail und falschem Passwort.
    return NextResponse.json({ error: "E-Mail oder Passwort ist falsch." }, { status: 401 });
  }

  await clearFailures(key);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(), sessionCookieOptions);
  return response;
}
