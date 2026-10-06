import { NextRequest, NextResponse } from "next/server";
import { createSubmission, markQuestionsSent } from "@/lib/submissions";
import { isDbConfigured } from "@/lib/supabase";
import { MAIL_TO, CONTACT_EMAIL } from "@/lib/site";
import { sendMail } from "@/lib/mail";
import { getQuestionnaire, renderQuestionnaireEmail } from "@/lib/questionnaire";
import {
  FIELD_LIMITS,
  guardPublicForm,
  isValidEmail,
  readJsonBody,
  sanitizeText,
} from "@/lib/formGuard";

const FALLBACK = `Bitte versuche es erneut oder schreib mir direkt an ${CONTACT_EMAIL}.`;

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request);
  if (!body) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!isDbConfigured()) {
    console.error("Kontaktformular: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen");
    return NextResponse.json(
      { error: `Das Formular ist gerade nicht erreichbar. Schreib mir bitte direkt an ${CONTACT_EMAIL}.` },
      { status: 503 },
    );
  }

  // Bot-Erkennung und Rate-Limit vor jeder Datenbank- oder Mail-Aktion.
  const guard = await guardPublicForm(request, body);
  if (!guard.ok) {
    // Honeypot-Treffer bekommen eine ganz normale Erfolgsantwort.
    if (guard.status === 200) return NextResponse.json({ success: true });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const name = sanitizeText(body.name, FIELD_LIMITS.name);
  const email = sanitizeText(body.email, FIELD_LIMITS.email);
  const message = sanitizeText(body.message, FIELD_LIMITS.message);
  const consent = body.consent === true;
  const wantsQuestions = body.wantsQuestions === true;

  if (!name || !email || !message || !consent) {
    return NextResponse.json({ error: "Bitte fülle alle Pflichtfelder aus." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." }, { status: 400 });
  }

  let id: string;
  try {
    id = await createSubmission({ name, email, message, wantsQuestions });
  } catch (err) {
    console.error("Kontaktformular: Speichern fehlgeschlagen", err);
    return NextResponse.json({ error: `Etwas ist schiefgelaufen. ${FALLBACK}` }, { status: 500 });
  }

  // Die Nachricht steht jetzt in der Datenbank und ist im Admin sichtbar –
  // E-Mail-Probleme dürfen die Antwort an die Besucher:in nicht mehr kippen.
  const notify = await sendMail({
    to: MAIL_TO,
    replyTo: email,
    subject: wantsQuestions
      ? `Neue Nachricht von ${name} (möchte die Reflexionsfragen)`
      : `Neue Nachricht von ${name}`,
    text:
      `Name: ${name}\nE-Mail: ${email}\n` +
      (wantsQuestions ? "Wunsch: die 7 Reflexionsfragen per E-Mail\n" : "") +
      `\nNachricht:\n${message}`,
  });
  if (!notify.ok) console.error("Kontaktformular: Benachrichtigung fehlgeschlagen", notify.error);

  if (wantsQuestions) {
    try {
      const questionnaire = await getQuestionnaire();
      if (questionnaire.autoSend) {
        const { subject, text, html } = renderQuestionnaireEmail(questionnaire, name);
        const sent = await sendMail({ to: email, replyTo: MAIL_TO, subject, text, html });
        if (sent.ok) await markQuestionsSent(id, Date.now());
      }
    } catch (err) {
      console.error("Kontaktformular: automatischer Fragen-Versand fehlgeschlagen", err);
    }
  }

  return NextResponse.json({ success: true });
}
