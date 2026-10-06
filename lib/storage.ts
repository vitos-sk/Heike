import { getDb, IMAGE_BUCKET } from "@/lib/supabase";
import { listPosts } from "@/lib/posts";
import type { Post, PostInput } from "@/types/post";

// Dateinamen auf unproblematische Zeichen reduzieren.
export function safeFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "bild";
}

export async function uploadImage(
  bytes: Uint8Array,
  fileName: string,
  contentType: string,
): Promise<string> {
  const path = `posts/${Date.now()}-${safeFileName(fileName)}`;
  const storage = getDb().storage.from(IMAGE_BUCKET);
  const { error } = await storage.upload(path, bytes, { contentType, upsert: false });
  if (error) throw error;
  return storage.getPublicUrl(path).data.publicUrl;
}

// Pfad im Bucket, wenn die URL zu unserem eigenen Speicher gehört – sonst null.
function ownPath(url: string): string | null {
  const base = process.env.SUPABASE_URL;
  if (!base) return null;
  const prefix = `${base.replace(/\/$/, "")}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

// Alle eigenen Bild-Pfade eines Beitrags: Titelbild plus alle Bildblöcke.
export function collectImagePaths(post: Post | PostInput): string[] {
  const urls: string[] = [];
  if (post.coverImageUrl) urls.push(post.coverImageUrl);
  for (const block of post.blocks) {
    if (block.type === "image" && block.url) urls.push(block.url);
  }
  return urls.map(ownPath).filter((path): path is string => path !== null);
}

// Löscht Bilder, die in keinem anderen Beitrag mehr vorkommen. Fehler werden nur
// geloggt: Speichern/Löschen eines Beitrags darf daran nicht scheitern.
async function deleteUnused(paths: string[], exceptPostId: string): Promise<void> {
  if (paths.length === 0) return;
  try {
    const posts = await listPosts();
    const stillUsed = new Set<string>();
    for (const post of posts) {
      if (post.id === exceptPostId) continue;
      for (const path of collectImagePaths(post)) stillUsed.add(path);
    }
    const orphans = [...new Set(paths)].filter((path) => !stillUsed.has(path));
    if (orphans.length === 0) return;
    const { error } = await getDb().storage.from(IMAGE_BUCKET).remove(orphans);
    if (error) throw error;
  } catch (error) {
    console.error("Bilder aufräumen fehlgeschlagen:", error);
  }
}

export async function deletePostImages(post: Post): Promise<void> {
  await deleteUnused(collectImagePaths(post), post.id);
}

export async function deleteRemovedPostImages(previous: Post, next: PostInput): Promise<void> {
  const kept = new Set(collectImagePaths(next));
  const removed = collectImagePaths(previous).filter((path) => !kept.has(path));
  await deleteUnused(removed, previous.id);
}
