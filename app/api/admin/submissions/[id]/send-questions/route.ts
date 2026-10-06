import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getQuestionnaire, renderQuestionnaireEmail } from "@/lib/questionnaire";
import { getSubmission, markQuestionsSent, updateSubmission } from "@/lib/submissions";
import { isMailConfigured, sendMail } from "@/lib/mail";
import { MAIL_TO } from "@/lib/site";

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const submission = await getSubmission(params.id);
    if (!submission) {
      return NextResponse.json({ error: "Nachricht nicht gefunden." }, { status: 404 });
    }

    const questionnaire = await getQuestionnaire();
    if (questionnaire.questions.every((question) => !question.trim())) {
      return NextResponse.json(
        { error: "Die Vorlage ist noch leer – bitte zuerst die Fragen anlegen." },
        { status: 400 },
      );
    }
    if (!isMailConfigured()) {
      return NextResponse.json(
        { error: "E-Mail-Versand ist nicht eingerichtet (RESEND_API_KEY fehlt)." },
        { status: 500 },
      );
    }

    const { subject, text, html } = renderQuestionnaireEmail(questionnaire, submission.name);
    const sent = await sendMail({
      to: submission.email,
      replyTo: MAIL_TO,
      subject,
      text,
      html,
    });
    if (!sent.ok) {
      return NextResponse.json({ error: "Die E-Mail konnte nicht versendet werden." }, { status: 502 });
    }

    const sentAt = Date.now();
    await markQuestionsSent(params.id, sentAt);
    // Wer die Fragen bekommen hat, gilt als bearbeitet – außer die Nachricht ist schon im Archiv.
    if (submission.status === "new" || submission.status === "read") {
      await updateSubmission(params.id, { status: "answered" });
    }
    revalidatePath("/admin", "layout");

    return NextResponse.json({ ok: true, sentAt });
  } catch (error) {
    console.error("Reflexionsfragen senden fehlgeschlagen:", error);
    return NextResponse.json({ error: "Senden fehlgeschlagen." }, { status: 500 });
  }
}
