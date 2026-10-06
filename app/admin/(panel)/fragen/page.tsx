import QuestionnaireForm from "@/components/admin/QuestionnaireForm";
import { getQuestionnaire } from "@/lib/questionnaire";
import { isMailConfigured } from "@/lib/mail";

export const metadata = { title: "Fragen" };

export default async function QuestionsPage() {
  const questionnaire = await getQuestionnaire();
  return <QuestionnaireForm initial={questionnaire} mailConfigured={isMailConfigured()} />;
}
