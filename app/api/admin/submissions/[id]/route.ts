import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteSubmission, updateSubmission } from "@/lib/submissions";
import type { SubmissionStatus } from "@/types/submission";

interface RouteParams {
  params: { id: string };
}

const STATUSES: SubmissionStatus[] = ["new", "read", "answered", "archived"];

export async function PATCH(request: Request, { params }: RouteParams) {
  const body = (await request.json().catch(() => null)) as { status?: unknown; note?: unknown } | null;
  if (!body) return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });

  const status = STATUSES.includes(body.status as SubmissionStatus)
    ? (body.status as SubmissionStatus)
    : undefined;
  const note = typeof body.note === "string" ? body.note : undefined;
  if (!status && note === undefined) {
    return NextResponse.json({ error: "Keine Änderung angegeben." }, { status: 400 });
  }

  try {
    await updateSubmission(params.id, { status, note });
    revalidatePath("/admin", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Nachricht aktualisieren fehlgeschlagen:", error);
    return NextResponse.json({ error: "Aktualisieren fehlgeschlagen." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await deleteSubmission(params.id);
    revalidatePath("/admin", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Nachricht löschen fehlgeschlagen:", error);
    return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  }
}
