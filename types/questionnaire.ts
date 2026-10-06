export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 30;

// Platzhalter, der beim Versand durch den Namen der Empfänger:in ersetzt wird.
export const NAME_PLACEHOLDER = "{name}";

export interface Questionnaire {
  subject: string;
  intro: string;
  questions: string[];
  outro: string;
  // Fragen sofort nach der Anfrage automatisch verschicken
  autoSend: boolean;
  updatedAt: number;
}

export type QuestionnaireInput = Omit<Questionnaire, "updatedAt">;
