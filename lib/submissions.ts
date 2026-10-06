import { getDb } from "@/lib/supabase";
import type { Submission, SubmissionInput, SubmissionStatus } from "@/types/submission";

const TABLE = "submissions";
const STATUSES: SubmissionStatus[] = ["new", "read", "answered", "archived"];

type Row = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  wants_questions: boolean;
  status: string;
  questions_sent_at: string | null;
  note: string | null;
};

function toSubmission(row: Row): Submission {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    wantsQuestions: row.wants_questions,
    status: STATUSES.includes(row.status as SubmissionStatus)
      ? (row.status as SubmissionStatus)
      : "new",
    createdAt: new Date(row.created_at).getTime(),
    questionsSentAt: row.questions_sent_at ? new Date(row.questions_sent_at).getTime() : null,
    note: row.note ?? "",
  };
}

export async function listSubmissions(): Promise<Submission[]> {
  const { data, error } = await getDb()
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(toSubmission);
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const { data, error } = await getDb().from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toSubmission(data as Row) : null;
}

export async function createSubmission(input: SubmissionInput): Promise<string> {
  const { data, error } = await getDb()
    .from(TABLE)
    .insert({
      name: input.name,
      email: input.email,
      message: input.message,
      wants_questions: input.wantsQuestions,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateSubmission(
  id: string,
  patch: { status?: SubmissionStatus; note?: string },
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (patch.status && STATUSES.includes(patch.status)) update.status = patch.status;
  if (typeof patch.note === "string") update.note = patch.note.slice(0, 4000);
  if (Object.keys(update).length === 0) return;

  const { error } = await getDb().from(TABLE).update(update).eq("id", id);
  if (error) throw error;
}

export async function markQuestionsSent(id: string, sentAt: number): Promise<void> {
  const { error } = await getDb()
    .from(TABLE)
    .update({ questions_sent_at: new Date(sentAt).toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSubmission(id: string): Promise<void> {
  const { error } = await getDb().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
