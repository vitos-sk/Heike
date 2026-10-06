"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PostCard from "@/components/blog/PostCard";
import { POST_FILTERS, matchesFilter, type PostFilter } from "@/lib/postContentPublic";
import type { Post } from "@/types/post";

// Daten kommen fertig vom Server: Suche und Filter laufen im Browser, ohne Neuladen.
export default function BlogIndex({
  posts,
  searchTexts,
  pastIds,
}: {
  posts: Post[];
  searchTexts: Record<string, string>;
  pastIds: string[];
}) {
  const [filter, setFilter] = useState<PostFilter>("alle");
  const [query, setQuery] = useState("");

  const past = useMemo(() => new Set(pastIds), [pastIds]);
  const needle = query.trim().toLowerCase();
  const visible = posts.filter(
    (post) => matchesFilter(post, filter) && (!needle || (searchTexts[post.id] ?? "").includes(needle)),
  );

  return (
    <>
      <div className="blog-tools">
        <div className="blog-chips" role="tablist" aria-label="Filter">
          {POST_FILTERS.map((f) => (
            <button key={f.id} type="button" role="tab" aria-selected={filter === f.id} className={filter === f.id ? "on" : undefined} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <label className="blog-search">
          <Search className="ic" strokeWidth={1.6} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Beiträge durchsuchen" aria-label="Beiträge durchsuchen" />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="blog-empty" role="status">
          {posts.length === 0 ? "Hier erscheinen bald die ersten Beiträge." : "Dazu habe ich nichts gefunden."}
        </p>
      ) : (
        <div className="news-grid">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} past={past.has(post.id)} />
          ))}
        </div>
      )}
    </>
  );
}
