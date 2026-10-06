import type { Post } from "@/types/post";
import { blocksPlainText } from "@/lib/postContent";

export type PostFilter = "alle" | "events" | "beitraege";

export const POST_FILTERS: Array<{ id: PostFilter; label: string }> = [
  { id: "alle", label: "Alle" },
  { id: "events", label: "Events" },
  { id: "beitraege", label: "Beiträge" },
];

export function matchesFilter(post: Post, filter: PostFilter): boolean {
  if (filter === "events") return post.type === "event";
  if (filter === "beitraege") return post.type !== "event";
  return true;
}

export function postSearchText(post: Post): string {
  return [post.title, post.excerpt, blocksPlainText(post.blocks)].join(" ").toLowerCase();
}
