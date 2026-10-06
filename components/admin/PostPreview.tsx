"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import PostBody from "@/components/blog/PostBody";
import PostHeader from "@/components/blog/PostHeader";
import type { PostBlock, PostType } from "@/types/post";

export type PreviewPost = {
  type: PostType;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  blocks: PostBlock[];
  eventDate: string | null;
  eventTime: string | null;
  eventLocation: string | null;
  eventCtaLabel: string | null;
  eventCtaHref: string | null;
  publishedAt: number;
};

export default function PostPreview({ post, onClose }: { post: PreviewPost; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="adm-preview" role="dialog" aria-modal="true" aria-label="Vorschau">
      <div className="adm-preview-bar">
        <span>Vorschau – so sieht es auf der Website aus</span>
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          <X className="ic" strokeWidth={1.6} aria-hidden="true" />
          Schließen
        </button>
      </div>
      <div className="adm-preview-scroll">
        <article className="pb-article">
          <PostHeader post={post} />
          <PostBody blocks={post.blocks.filter((b) => !(b.type === "image" && !b.url))} />
        </article>
      </div>
    </div>
  );
}
