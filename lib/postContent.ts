import { EXCERPT_MAX_LENGTH, type Post, type PostBlock, type PostInput } from "@/types/post";
import { slugify } from "@/lib/slug";

const WORDS_PER_MINUTE = 200;

/** Reiner Text eines Blocks — für Suche, Lesezeit und Auto-Excerpt. */
export function blockPlainText(block: PostBlock): string {
  switch (block.type) {
    case "paragraph":
      return block.text;
    case "heading":
      return block.text;
    case "image":
      return [block.alt, block.caption ?? ""].join(" ");
    case "quote":
      return [block.text, block.author ?? ""].join(" ");
    case "list":
      return block.items.join(" ");
    case "button":
      return block.label;
    default:
      return "";
  }
}

export function blocksPlainText(blocks: PostBlock[]): string {
  return blocks.map(blockPlainText).join(" ");
}

/** Durchsuchbarer Text eines Beitrags: Titel, Kurzbeschreibung und Inhalt. */
export function postSearchText(post: Post): string {
  return [post.title, post.excerpt, blocksPlainText(post.blocks)].join(" ").toLowerCase();
}

export function readingTimeMinutes(blocks: PostBlock[]): number {
  const words = blocksPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Erster Absatz, gekürzt auf die Excerpt-Länge — ohne Wörter zu zerschneiden. */
export function excerptFromBlocks(blocks: PostBlock[]): string {
  const paragraph = blocks.find((block) => block.type === "paragraph");
  const text = paragraph ? paragraph.text.replace(/\s+/g, " ").trim() : "";
  if (text.length <= EXCERPT_MAX_LENGTH) return text;

  const cut = text.slice(0, EXCERPT_MAX_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Ein Block gilt als leer, wenn er nichts Sichtbares beiträgt. */
export function isEmptyBlock(block: PostBlock): boolean {
  switch (block.type) {
    case "paragraph":
    case "heading":
      return block.text.trim() === "";
    case "image":
      return block.url.trim() === "";
    case "quote":
      return block.text.trim() === "";
    case "list":
      return block.items.every((item) => item.trim() === "");
    case "button":
      return block.label.trim() === "" || block.href.trim() === "";
    case "divider":
      return false;
    default:
      return true;
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asPositiveInt(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value < 20000
    ? Math.round(value)
    : undefined;
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text === "" ? null : text;
}

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

/**
 * Baut aus unbekanntem JSON eine saubere Block-Liste: unbekannte Typen und
 * leere Blöcke fliegen raus, damit in der Datenbank nie `undefined` landet.
 */
export function sanitizeBlocks(raw: unknown): PostBlock[] {
  if (!Array.isArray(raw)) return [];

  const blocks: PostBlock[] = [];

  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const data = entry as Record<string, unknown>;
    const id = asString(data.id) || randomId();

    switch (data.type) {
      case "paragraph":
        blocks.push({ id, type: "paragraph", text: asString(data.text).trim() });
        break;
      case "heading":
        blocks.push({
          id,
          type: "heading",
          text: asString(data.text).trim(),
          level: data.level === 3 ? 3 : 2,
        });
        break;
      case "image":
        blocks.push({
          id,
          type: "image",
          url: asString(data.url).trim(),
          alt: asString(data.alt).trim(),
          caption: asNullableString(data.caption),
          width: data.width === "wide" ? "wide" : "normal",
          ...(asPositiveInt(data.w) && asPositiveInt(data.h)
            ? { w: asPositiveInt(data.w), h: asPositiveInt(data.h) }
            : {}),
        });
        break;
      case "quote":
        blocks.push({
          id,
          type: "quote",
          text: asString(data.text).trim(),
          author: asNullableString(data.author),
        });
        break;
      case "list":
        blocks.push({
          id,
          type: "list",
          style: data.style === "number" ? "number" : "bullet",
          items: Array.isArray(data.items)
            ? data.items.map(asString).map((item) => item.trim()).filter(Boolean)
            : [],
        });
        break;
      case "button":
        blocks.push({
          id,
          type: "button",
          label: asString(data.label).trim(),
          href: asString(data.href).trim(),
        });
        break;
      case "divider":
        blocks.push({ id, type: "divider" });
        break;
      default:
        break;
    }
  }

  return blocks.filter((block) => !isEmptyBlock(block));
}

export type ParseResult =
  | { ok: true; input: PostInput }
  | { ok: false; error: string };

/** Validiert und normalisiert den Request-Body der Admin-API. */
export function parsePostInput(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Ungültige Daten." };
  }

  const data = body as Record<string, unknown>;
  const title = asString(data.title).trim();
  if (!title) {
    return { ok: false, error: "Titel ist erforderlich." };
  }

  const slug = slugify(asString(data.slug) || title);
  if (!slug) {
    return { ok: false, error: "Die Link-Adresse (Slug) ist erforderlich." };
  }

  if (data.blocks !== undefined && !Array.isArray(data.blocks)) {
    return { ok: false, error: "Der Inhalt konnte nicht gelesen werden." };
  }

  const type =
    data.type === "event" || data.type === "announcement" || data.type === "article"
      ? data.type
      : "article";
  const isEvent = type === "event";

  return {
    ok: true,
    input: {
      type,
      title,
      slug,
      excerpt: asString(data.excerpt).trim().slice(0, EXCERPT_MAX_LENGTH),
      coverImageUrl: asNullableString(data.coverImageUrl),
      coverImageAlt: asString(data.coverImageAlt).trim(),
      blocks: sanitizeBlocks(data.blocks),
      eventDate: isEvent ? asNullableString(data.eventDate) : null,
      eventTime: isEvent ? asNullableString(data.eventTime) : null,
      eventLocation: isEvent ? asNullableString(data.eventLocation) : null,
      eventCtaLabel: isEvent ? asNullableString(data.eventCtaLabel) : null,
      eventCtaHref: isEvent ? asNullableString(data.eventCtaHref) : null,
      status: data.status === "published" ? "published" : "draft",
      publishedAt: typeof data.publishedAt === "number" ? data.publishedAt : Date.now(),
      pinned: data.pinned === true,
    },
  };
}
