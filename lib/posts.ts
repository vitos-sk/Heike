import { getDb } from "@/lib/supabase";
import type { Post, PostBlock, PostInput, PostType } from "@/types/post";

const TABLE = "posts";
const POST_TYPES: PostType[] = ["event", "announcement", "article"];

type Row = {
  id: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  cover_image_alt: string;
  blocks: unknown;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  event_cta_label: string | null;
  event_cta_href: string | null;
  status: string;
  published_at: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

function toPost(row: Row): Post {
  return {
    id: row.id,
    type: POST_TYPES.includes(row.type as PostType) ? (row.type as PostType) : "article",
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt ?? "",
    blocks: Array.isArray(row.blocks) ? (row.blocks as PostBlock[]) : [],
    eventDate: row.event_date,
    eventTime: row.event_time,
    eventLocation: row.event_location,
    eventCtaLabel: row.event_cta_label,
    eventCtaHref: row.event_cta_href,
    status: row.status === "published" ? "published" : "draft",
    publishedAt: new Date(row.published_at).getTime(),
    pinned: row.pinned === true,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function toRow(input: PostInput) {
  return {
    type: input.type,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    cover_image_url: input.coverImageUrl,
    cover_image_alt: input.coverImageAlt,
    blocks: input.blocks,
    event_date: input.eventDate,
    event_time: input.eventTime,
    event_location: input.eventLocation,
    event_cta_label: input.eventCtaLabel,
    event_cta_href: input.eventCtaHref,
    status: input.status,
    published_at: new Date(input.publishedAt).toISOString(),
    pinned: input.pinned,
  };
}

// Angeheftete Beiträge zuerst, danach das neueste Veröffentlichungsdatum.
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.publishedAt - a.publishedAt;
  });
}

// Heutiges Datum als ISO-String in deutscher Zeit ("sv-SE" liefert YYYY-MM-DD).
export function todayIso(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

export function isPastEvent(post: Post): boolean {
  return post.type === "event" && post.eventDate !== null && post.eventDate < todayIso();
}

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await getDb().from(TABLE).select("*");
  if (error) throw error;
  return sortPosts((data as Row[]).map(toPost));
}

// Öffentliche Seiten: ein Datenbankfehler darf die Website nicht kaputt machen.
export async function listPublishedPosts(): Promise<Post[]> {
  try {
    const { data, error } = await getDb()
      .from(TABLE)
      .select("*")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString());
    if (error) throw error;
    return sortPosts((data as Row[]).map(toPost));
  } catch (error) {
    console.error("Beiträge konnten nicht geladen werden", error);
    return [];
  }
}

export async function listLatestPosts(limit: number): Promise<Post[]> {
  const posts = await listPublishedPosts();
  return posts.filter((post) => !isPastEvent(post)).slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data, error } = await getDb().from(TABLE).select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data ? toPost(data as Row) : null;
  } catch (error) {
    console.error("Beitrag konnte nicht geladen werden", error);
    return null;
  }
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await getDb().from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toPost(data as Row) : null;
}

export async function isSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const { data, error } = await getDb().from(TABLE).select("id").eq("slug", slug);
  if (error) throw error;
  return (data ?? []).some((row) => row.id !== exceptId);
}

export async function createPost(input: PostInput): Promise<string> {
  const { data, error } = await getDb().from(TABLE).insert(toRow(input)).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function updatePost(id: string, input: PostInput): Promise<void> {
  const { error } = await getDb()
    .from(TABLE)
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await getDb().from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
