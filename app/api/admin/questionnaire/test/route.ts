import { NextResponse } from "next/server";
import { getAdminAccount } from "@/lib/adminAccount";
import { normalizeQuestionnaire, renderQuestionnaireEmail } from "@/lib/questionnaire";
import { isMailConfigured, sendMail } from "@/lib/mail";

// Schickt die (auch noch ungespeicherte) Vorlage als Probe an die Admin-Adresse.
export async function POST(request: Request) {
  if (!isMailConfigured()) {
    return NextResponse.json({ error: "E-Mail-Versand ist nicht eingerichtet." }, { status: 500 });
  }

  try {
    const account = await getAdminAccount();
    if (!account) return NextResponse.json({ error: "Kein Admin-Konto vorhanden." }, { status: 500 });

    const input = normalizeQuestionnaire(await request.json().catch(() => null));
    if (input.questions.length === 0) {
      return NextResponse.json({ error: "Bitte formuliere mindestens eine Frage." }, { status: 400 });
    }

    const { subject, text, html } = renderQuestionnaireEmail(input, "Anna");
    const sent = await sendMail({ to: account.email, subject: `[Probe] ${subject}`, text, html });
    if (!sent.ok) {
      return NextResponse.json({ error: "Die Probe-E-Mail konnte nicht versendet werden." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, to: account.email });
  } catch (error) {
    console.error("Probe-Mail fehlgeschlagen:", error);
    return NextResponse.json({ error: "Senden fehlgeschlagen." }, { status: 500 });
  }
}
