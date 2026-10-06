import { escapeHtml } from "@/lib/escape";
import { reflection } from "@/lib/placeholder-data";
import {
  MAX_QUESTIONS,
  NAME_PLACEHOLDER,
  type Questionnaire,
  type QuestionnaireInput,
} from "@/types/questionnaire";

// Startvorlage: dieselben 7 Fragen wie auf der Website; Heike kann alles überschreiben.
export const DEFAULT_QUESTIONNAIRE: Questionnaire = {
  subject: "Deine 7 Reflexionsfragen",
  intro:
    `Hallo ${NAME_PLACEHOLDER},\n\n` +
    "schön, dass du dir einen Moment für dich nimmst. Hier sind deine Reflexionsfragen.\n\n" +
    "Nimm dir für jede Frage einen ruhigen Moment. Du musst nicht sofort auf alles eine Antwort haben.",
  questions: [...reflection.questions],
  outro:
    "Wenn du magst, schreib mir gern, was dir beim Beantworten aufgefallen ist – " +
    "ich freue mich auf deine Gedanken.\n\nHerzliche Grüße\nHeike",
  autoSend: false,
  updatedAt: 0,
};

function toText(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

// Leere Zeilen fliegen raus, damit questions.length überall die echte Anzahl ist.
function normalizeQuestions(value: unknown): string[] {
  const list = Array.isArray(value) ? value : [];
  return list
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, MAX_QUESTIONS);
}

export function normalizeQuestionnaire(value: unknown): QuestionnaireInput {
  const data = (value ?? {}) as Record<string, unknown>;
  return {
    subject: toText(data.subject, DEFAULT_QUESTIONNAIRE.subject).trim() || DEFAULT_QUESTIONNAIRE.subject,
    intro: toText(data.intro, ""),
    questions: normalizeQuestions(data.questions),
    outro: toText(data.outro, ""),
    autoSend: data.autoSend === true,
  };
}

function fillName(text: string, name: string): string {
  return text.split(NAME_PLACEHOLDER).join(name);
}

function paragraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;line-height:1.65;color:#4b4b43;">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

// E-Mail im Stil der Website: Creme, Salbei, Young Serif als Georgia-Fallback.
export function renderQuestionnaireEmail(questionnaire: Questionnaire | QuestionnaireInput, name: string) {
  const intro = fillName(questionnaire.intro, name).trim();
  const outro = fillName(questionnaire.outro, name).trim();
  const questions = questionnaire.questions.map((q) => q.trim()).filter(Boolean);
  const subject = fillName(questionnaire.subject, name);

  const text = [
    intro,
    questions.map((question, index) => `${index + 1}. ${question}`).join("\n\n"),
    outro,
  ]
    .filter(Boolean)
    .join("\n\n");

  const listItems = questions
    .map(
      (question) =>
        `<li style="margin:0 0 14px;line-height:1.6;color:#2f352d;font-size:17px;font-family:Georgia,'Times New Roman',serif;">${escapeHtml(question)}</li>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="de">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
  <body style="margin:0;padding:24px 12px;background:#f7f3eb;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:28px;padding:36px 32px;">
      <h1 style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;font-weight:normal;color:#647560;">${escapeHtml(subject)}</h1>
      ${paragraphs(intro)}
      <ol style="margin:8px 0 28px;padding-left:22px;">${listItems}</ol>
      ${paragraphs(outro)}
    </div>
  </body>
</html>`;

  return { subject, text, html };
}
