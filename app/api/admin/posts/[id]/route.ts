import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deletePost, getPost, isSlugTaken, updatePost } from "@/lib/posts";
import { parsePostInput } from "@/lib/postContent";
import { deletePostImages, deleteRemovedPostImages } from "@/lib/storage";

interface RouteParams {
  params: { id: string };
}

function revalidatePost(slug: string, previousSlug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog/feed.xml");
  revalidatePath("/sitemap.xml");
  // Bei geändertem Slug muss auch der alte Pfad neu gebaut werden.
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const existing = await getPost(id);
    if (!existing) {
      return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });
    }

    const parsed = parsePostInput(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (await isSlugTaken(parsed.input.slug, id)) {
      return NextResponse.json(
        { error: `Die Link-Adresse „${parsed.input.slug}“ ist bereits vergeben.` },
        { status: 409 },
      );
    }

    await updatePost(id, parsed.input);
    // Ausgetauschte oder entfernte Bilder aus dem Speicher löschen.
    await deleteRemovedPostImages(existing, parsed.input);
    revalidatePost(parsed.input.slug, existing.slug);

    return NextResponse.json({ ok: true, slug: parsed.input.slug });
  } catch (error) {
    console.error("Beitrag speichern fehlgeschlagen:", error);
    return NextResponse.json({ error: "Speichern fehlgeschlagen." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = params;

  try {
    const existing = await getPost(id);
    await deletePost(id);
    if (existing) await deletePostImages(existing);
    revalidatePost(existing?.slug ?? "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Beitrag löschen fehlgeschlagen:", error);
    return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  }
}
