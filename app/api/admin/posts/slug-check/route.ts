import { NextResponse, type NextRequest } from "next/server";
import { isSlugTaken } from "@/lib/posts";
import { slugify } from "@/lib/slug";

// Gibt zurück, ob die Link-Adresse frei ist, und – falls nicht – einen freien Vorschlag.
export async function GET(request: NextRequest) {
  const slug = slugify(request.nextUrl.searchParams.get("slug") ?? "");
  const exceptId = request.nextUrl.searchParams.get("exceptId") ?? undefined;
  if (!slug) return NextResponse.json({ slug: "", available: false, suggestion: "" });

  try {
    if (!(await isSlugTaken(slug, exceptId))) {
      return NextResponse.json({ slug, available: true, suggestion: slug });
    }
    let suffix = 2;
    let candidate = `${slug}-${suffix}`;
    while (await isSlugTaken(candidate, exceptId)) {
      suffix += 1;
      candidate = `${slug}-${suffix}`;
    }
    return NextResponse.json({ slug, available: false, suggestion: candidate });
  } catch (error) {
    console.error("Slug-Prüfung fehlgeschlagen:", error);
    return NextResponse.json({ error: "Prüfung fehlgeschlagen." }, { status: 500 });
  }
}
