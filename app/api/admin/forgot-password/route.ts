import { NextResponse } from "next/server";
import { getAdminAccount, normalizeEmail } from "@/lib/adminAccount";
import { RESET_LINK_VALID_MINUTES, createResetToken } from "@/lib/passwordReset";
import { GATE_QUERY_PARAM } from "@/lib/gate";
import { consumeQuota, getClientIp } from "@/lib/rateLimit";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/site";

const MAX_ATTEMPTS = 3;
const WINDOW_MS = 15 * 60 * 1000;

function buildResetLink(request: Request, token: string): string {
  // Der Admin ist hinter dem Gate versteckt: der Gate-Key muss mit in den Link,
  // sonst landet Heike auf einer 404-Seite.
  const origin = new URL(request.url).origin || SITE_URL;
  const url = new URL("/admin/reset-password", origin);
  url.searchParams.set("token", token);
  const gateKey = process.env.ADMIN_GATE_KEY;
  if (gateKey) url.searchParams.set(GATE_QUERY_PARAM, gateKey);
  return url.toString();
}

function renderEmail(link: string) {
  const text =
    "Hallo Heike,\n\n" +
    "du hast ein neues Passwort für den Admin-Bereich angefordert.\n\n" +
    `Hier kannst du es setzen (Link ${RESET_LINK_VALID_MINUTES} Minuten gültig):\n${link}\n\n` +
    "Falls du das nicht warst, ignoriere diese E-Mail einfach – dein aktuelles Passwort bleibt unverändert.";

  const html = `<!doctype html><html lang="de"><body style="margin:0;padding:24px 12px;background:#f7f3eb;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:28px;padding:32px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#2f352d;line-height:1.6;">
      <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:24px;color:#647560;">Neues Passwort</h1>
      <p>Hallo Heike,</p>
      <p>du hast ein neues Passwort für den Admin-Bereich angefordert.</p>
      <p style="margin:24px 0;"><a href="${link}" style="background:#647560;color:#fff;padding:13px 24px;border-radius:999px;text-decoration:none;display:inline-block;font-weight:600;">Neues Passwort setzen</a></p>
      <p style="font-size:14px;color:#4b4b43;">Der Link ist ${RESET_LINK_VALID_MINUTES} Minuten gültig und kann nur einmal verwendet werden.</p>
      <p style="font-size:14px;color:#4b4b43;">Falls du das nicht warst, ignoriere diese E-Mail einfach – dein aktuelles Passwort bleibt unverändert.</p>
    </div></body></html>`;
  return { text, html };
}

export async function POST(request: Request) {
  const allowed = await consumeQuota(`admin-forgot:${getClientIp(request)}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte in 15 Minuten erneut versuchen." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail((body as { email?: unknown } | null)?.email);

  // Immer dieselbe Antwort: so lässt sich nicht herausfinden, welche Adresse hinterlegt ist.
  const generic = NextResponse.json({ ok: true });
  if (!email) return generic;

  try {
    const account = await getAdminAccount();
    if (!account || account.email !== email) return generic;

    if (!isMailConfigured()) {
      console.error("Passwort-Reset: RESEND_API_KEY fehlt");
      return NextResponse.json({ error: "E-Mail-Versand ist nicht eingerichtet." }, { status: 500 });
    }

    const token = await createResetToken(account);
    const { text, html } = renderEmail(buildResetLink(request, token));
    const sent = await sendMail({
      to: account.email,
      subject: "Neues Passwort für den Admin-Bereich",
      text,
      html,
    });
    if (!sent.ok) {
      return NextResponse.json({ error: "Die E-Mail konnte nicht versendet werden." }, { status: 502 });
    }
  } catch (error) {
    console.error("Passwort-Reset fehlgeschlagen:", error);
    return NextResponse.json({ error: "Anfrage fehlgeschlagen." }, { status: 500 });
  }

  return generic;
}
