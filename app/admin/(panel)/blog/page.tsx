import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Eye, ImageOff, Pencil, Pin, Plus, PenLine } from "lucide-react";
import { isPastEvent, listPosts } from "@/lib/posts";
import { formatEventDate, formatTimestampShort } from "@/lib/postDate";
import { POST_TYPE_LABELS, type Post } from "@/types/post";
import DeletePostButton from "@/components/admin/DeletePostButton";

export const metadata = { title: "Blog" };

const FILTERS = [
  { id: "alle", label: "Alle" },
  { id: "entwuerfe", label: "Entwürfe" },
  { id: "veroeffentlicht", label: "Veröffentlicht" },
] as const;

function PostRow({ post }: { post: Post }) {
  const past = isPastEvent(post);
  const preview = post.status === "draft" ? `/blog/${post.slug}?preview=1` : `/blog/${post.slug}`;

  return (
    <li className="adm-post">
      <Link href={`/admin/blog/${post.id}`} className="adm-post-main">
        <span className="adm-thumb">
          {post.coverImageUrl ? (
            <Image src={post.coverImageUrl} alt="" width={120} height={120} sizes="5rem" />
          ) : (
            <ImageOff className="ic" strokeWidth={1.5} aria-hidden="true" />
          )}
        </span>
        <span className="txt">
          <span className="ttl">
            {post.pinned && <Pin className="ic" strokeWidth={1.8} aria-label="Oben angeheftet" />}
            {post.title}
          </span>
          <span className="meta">
            <span className="adm-pill">{POST_TYPE_LABELS[post.type]}</span>
            {post.status === "draft" ? (
              <span className="adm-pill warn">Entwurf</span>
            ) : (
              <span className="adm-pill ok">Veröffentlicht</span>
            )}
            {past && <span className="adm-pill">Vergangen</span>}
            <span className="when">
              <CalendarDays className="ic" strokeWidth={1.6} aria-hidden="true" />
              {post.type === "event" && post.eventDate
                ? formatEventDate(post.eventDate)
                : formatTimestampShort(post.publishedAt)}
            </span>
          </span>
        </span>
      </Link>
      <div className="adm-post-act">
        <a
          className="adm-iconbtn"
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`„${post.title}“ in der Vorschau öffnen`}
          title="Vorschau"
        >
          <Eye className="ic" strokeWidth={1.6} aria-hidden="true" />
        </a>
        <Link className="adm-iconbtn" href={`/admin/blog/${post.id}`} aria-label={`„${post.title}“ bearbeiten`} title="Bearbeiten">
          <Pencil className="ic" strokeWidth={1.6} aria-hidden="true" />
        </Link>
        <DeletePostButton id={post.id} title={post.title} />
      </div>
    </li>
  );
}

export default async function BlogAdminPage({ searchParams }: { searchParams: { f?: string } }) {
  const posts = await listPosts();
  const filter = FILTERS.some((f) => f.id === searchParams.f) ? searchParams.f! : "alle";

  const visible = posts.filter((p) =>
    filter === "entwuerfe" ? p.status === "draft" : filter === "veroeffentlicht" ? p.status === "published" : true,
  );
  const count = (id: string) =>
    posts.filter((p) => (id === "entwuerfe" ? p.status === "draft" : id === "veroeffentlicht" ? p.status === "published" : true)).length;

  return (
    <div className="adm-page">
      <header className="adm-head adm-head--row">
        <div>
          <h1 className="adm-h1">Blog</h1>
          <p className="adm-sub">
            {posts.length} {posts.length === 1 ? "Beitrag" : "Beiträge"} – Neuigkeiten, Ankündigungen und Events für deine Website.
          </p>
        </div>
        <Link href="/admin/blog/neu" className="btn">
          <Plus className="ic" strokeWidth={1.6} aria-hidden="true" />
          Neuer Beitrag
        </Link>
      </header>

      <div className="adm-chips" role="tablist" aria-label="Filter">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={f.id === "alle" ? "/admin/blog" : `/admin/blog?f=${f.id}`}
            role="tab"
            aria-selected={filter === f.id}
            className={filter === f.id ? "on" : undefined}
          >
            {f.label}
            <span>{count(f.id)}</span>
          </Link>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="adm-empty">
          <PenLine className="ic" strokeWidth={1.6} aria-hidden="true" />
          <p>{posts.length === 0 ? "Noch kein Beitrag. Schreib den ersten." : "In diesem Filter ist nichts."}</p>
          {posts.length === 0 && (
            <Link href="/admin/blog/neu" className="btn">
              Ersten Beitrag schreiben
            </Link>
          )}
        </div>
      ) : (
        <ul className="adm-posts">
          {visible.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      )}
    </div>
  );
}
