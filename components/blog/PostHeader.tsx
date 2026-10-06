import Image from "next/image";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { formatEventDate, formatTimestamp } from "@/lib/postDate";
import { POST_TYPE_LABELS, type PostType } from "@/types/post";

type HeaderPost = {
  type: PostType;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  eventDate: string | null;
  eventTime: string | null;
  eventLocation: string | null;
  eventCtaLabel: string | null;
  eventCtaHref: string | null;
  publishedAt: number;
};

// Kopf eines Beitrags – öffentlich und in der Admin-Vorschau identisch.
export default function PostHeader({ post, readingMinutes }: { post: HeaderPost; readingMinutes?: number }) {
  const isEvent = post.type === "event";

  return (
    <header className="pb-head">
      <p className="pb-meta">
        <span className="pill">{POST_TYPE_LABELS[post.type]}</span>
        <span>
          {isEvent && post.eventDate ? formatEventDate(post.eventDate) : formatTimestamp(post.publishedAt)}
        </span>
        {readingMinutes ? <span>{readingMinutes} Min. Lesezeit</span> : null}
      </p>
      <h1 className="pb-title">{post.title || "Ohne Titel"}</h1>
      {post.excerpt && <p className="pb-lead">{post.excerpt}</p>}

      {isEvent && (post.eventDate || post.eventTime || post.eventLocation) && (
        <ul className="pb-event">
          {post.eventDate && (
            <li>
              <CalendarDays className="ic" strokeWidth={1.6} aria-hidden="true" />
              {formatEventDate(post.eventDate)}
            </li>
          )}
          {post.eventTime && (
            <li>
              <Clock className="ic" strokeWidth={1.6} aria-hidden="true" />
              {post.eventTime}
            </li>
          )}
          {post.eventLocation && (
            <li>
              <MapPin className="ic" strokeWidth={1.6} aria-hidden="true" />
              {post.eventLocation}
            </li>
          )}
        </ul>
      )}

      {isEvent && post.eventCtaLabel && post.eventCtaHref && (
        <p className="pb-btn">
          <a className="btn" href={post.eventCtaHref}>
            {post.eventCtaLabel}
          </a>
        </p>
      )}

      {post.coverImageUrl && (
        <figure className="pb-cover">
          <Image
            src={post.coverImageUrl}
            alt={post.coverImageAlt}
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 64rem, 100vw"
            priority
          />
        </figure>
      )}
    </header>
  );
}
