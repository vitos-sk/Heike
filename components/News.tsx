import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listLatestPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";

// Neuigkeiten auf der Startseite – erscheint nur, wenn es veröffentlichte Beiträge gibt.
export default async function News() {
  const posts = await listLatestPosts(3);
  if (posts.length === 0) return null;

  return (
    <section id="aktuelles" className="sec news" aria-labelledby="news-h">
      <div className="wrap">
        <div className="news-head">
          <h2 className="t-h2 rv" id="news-h">
            Aktuelles
          </h2>
          <Link href="/blog" className="btn btn--ghost rv">
            Alle Beiträge
            <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>
        <div className="news-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
