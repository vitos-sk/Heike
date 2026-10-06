import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getQuestionnaire, normalizeQuestionnaire, saveQuestionnaire } from "@/lib/questionnaire";
import { MIN_QUESTIONS } from "@/types/questionnaire";

export async function GET() {
  try {
    return NextResponse.json(await getQuestionnaire());
  } catch (error) {
    console.error("Vorlage laden fehlgeschlagen:", error);
    return NextResponse.json({ error: "Vorlage konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const input = normalizeQuestionnaire(await request.json().catch(() => null));

  if (input.questions.length < MIN_QUESTIONS) {
    return NextResponse.json({ error: "Bitte formuliere mindestens eine Frage." }, { status: 400 });
  }

  try {
    const saved = await saveQuestionnaire(input);
    revalidatePath("/admin", "layout");
    return NextResponse.json(saved);
  } catch (error) {
    console.error("Vorlage speichern fehlgeschlagen:", error);
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
  }
}
