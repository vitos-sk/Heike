import { NextResponse } from "next/server";
import { readImageSize } from "@/lib/imageSize";
import { uploadImage } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei erhalten." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Nur JPG-, PNG-, WebP- oder AVIF-Bilder sind erlaubt." },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Das Bild ist zu groß. Erlaubt sind maximal 8 MB." },
      { status: 413 },
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const size = readImageSize(bytes);
    const url = await uploadImage(bytes, file.name, file.type);
    return NextResponse.json(size ? { url, ...size } : { url });
  } catch (error) {
    console.error("Bild-Upload fehlgeschlagen:", error);
    return NextResponse.json({ error: "Das Bild konnte nicht hochgeladen werden." }, { status: 500 });
  }
}
