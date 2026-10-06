import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { formatEventDate, formatTimestamp } from "@/lib/postDate";
import { POST_TYPE_LABELS, type Post } from "@/types/post";

export default function PostCard({ post, past }: { post: Post; past?: boolean }) {
  const date = post.type === "event" && post.eventDate ? formatEventDate(post.eventDate) : formatTimestamp(post.publishedAt);

  return (
    <article className="pc">
      <Link href={`/blog/${post.slug}`} className="pc-link">
        <span className="pc-img">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.coverImageAlt}
              width={800}
              height={500}
              sizes="(min-width: 900px) 24rem, (min-width: 600px) 50vw, 100vw"
            />
          ) : (
            <span className="pc-ph" aria-hidden="true">
              <CalendarDays className="ic" strokeWidth={1.4} />
            </span>
          )}
        </span>
        <span className="pc-txt">
          <span className="pc-meta">
            <span className="pill">{POST_TYPE_LABELS[post.type]}</span>
            {past && <span className="pill">Vergangen</span>}
            <time dateTime={new Date(post.publishedAt).toISOString()}>{date}</time>
          </span>
          <h3 className="pc-title">{post.title}</h3>
          {post.excerpt && <p className="pc-ex">{post.excerpt}</p>}
          <span className="pc-more">
            Weiterlesen
            <ArrowUpRight className="ic" strokeWidth={1.6} aria-hidden="true" />
          </span>
        </span>
      </Link>
    </article>
  );
}
