export type SubmissionStatus = "new" | "read" | "answered" | "archived";

export interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  // Besucher:in hat die 7 Reflexionsfragen angefragt
  wantsQuestions: boolean;
  status: SubmissionStatus;
  createdAt: number;
  // Zeitpunkt, an dem die Fragen verschickt wurden — null, solange offen
  questionsSentAt: number | null;
  note: string;
}

export interface SubmissionInput {
  name: string;
  email: string;
  message: string;
  wantsQuestions: boolean;
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: "Neu",
  read: "Gelesen",
  answered: "Beantwortet",
  archived: "Archiv",
};
