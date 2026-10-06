import { NextResponse } from "next/server";
import {
  PASSWORD_MIN_LENGTH,
  getAdminAccount,
  isValidEmail,
  normalizeEmail,
  updateAdminAccount,
  verifyPassword,
} from "@/lib/adminAccount";
import { createSessionToken, SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session";

// Zugriff ist bereits durch die Middleware (Gate + Session) abgesichert.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { currentPassword, email, newPassword } = body as Record<string, unknown>;

  if (typeof currentPassword !== "string" || !currentPassword) {
    return NextResponse.json({ error: "Bitte gib dein aktuelles Passwort ein." }, { status: 400 });
  }

  const nextEmail = typeof email === "string" && email.trim() ? normalizeEmail(email) : null;
  const nextPassword = typeof newPassword === "string" && newPassword ? newPassword : null;

  if (!nextEmail && !nextPassword) {
    return NextResponse.json({ error: "Keine Änderungen angegeben." }, { status: 400 });
  }
  if (nextEmail && !isValidEmail(nextEmail)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse an." }, { status: 400 });
  }
  if (nextPassword && nextPassword.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { error: `Das neue Passwort braucht mindestens ${PASSWORD_MIN_LENGTH} Zeichen.` },
      { status: 400 },
    );
  }

  try {
    const account = await getAdminAccount();
    if (!account) {
      return NextResponse.json({ error: "Kein Admin-Konto vorhanden." }, { status: 500 });
    }
    if (!(await verifyPassword(currentPassword, account.passwordHash))) {
      return NextResponse.json({ error: "Das aktuelle Passwort ist falsch." }, { status: 401 });
    }

    const updated = await updateAdminAccount({
      email: nextEmail ?? undefined,
      password: nextPassword ?? undefined,
    });

    const response = NextResponse.json({ ok: true, email: updated.email });
    // Frische Session, damit die laufende Sitzung nicht mittendrin abläuft.
    response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error("Admin-Konto konnte nicht gespeichert werden:", error);
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
  }
}
