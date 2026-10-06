import { getDb } from "@/lib/supabase";
import {
  DEFAULT_QUESTIONNAIRE,
  normalizeQuestionnaire,
} from "@/lib/questionnaireTemplate";
import type { Questionnaire, QuestionnaireInput } from "@/types/questionnaire";

export {
  DEFAULT_QUESTIONNAIRE,
  normalizeQuestionnaire,
  renderQuestionnaireEmail,
} from "@/lib/questionnaireTemplate";

const SETTINGS_KEY = "reflexionsfragen";

export async function getQuestionnaire(): Promise<Questionnaire> {
  const { data, error } = await getDb()
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_QUESTIONNAIRE;

  const raw = data.value as Record<string, unknown>;
  const stored = normalizeQuestionnaire(raw);
  return {
    ...stored,
    questions: stored.questions.length > 0 ? stored.questions : DEFAULT_QUESTIONNAIRE.questions,
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
  };
}

export async function saveQuestionnaire(input: QuestionnaireInput): Promise<Questionnaire> {
  const value: Questionnaire = { ...normalizeQuestionnaire(input), updatedAt: Date.now() };
  const { error } = await getDb()
    .from("settings")
    .upsert({ key: SETTINGS_KEY, value, updated_at: new Date().toISOString() });
  if (error) throw error;
  return value;
}
