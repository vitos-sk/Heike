import type { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { isPastEvent, listPublishedPosts } from "@/lib/posts";
import { postSearchText } from "@/lib/postContentPublic";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Aktuelles",
  description: "Neuigkeiten, Ankündigungen und Events von Heike Schaub.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/feed.xml" } },
};

export default async function BlogPage() {
  const posts = await listPublishedPosts();
  const searchTexts = Object.fromEntries(posts.map((p) => [p.id, postSearchText(p)]));
  const pastIds = posts.filter(isPastEvent).map((p) => p.id);

  return (
    <main id="main" className="blog">
      <div className="wrap blog-in">
        <header className="blog-head">
          <h1 className="t-h1">Aktuelles</h1>
          <p className="t-lead">Neuigkeiten, Ankündigungen und Events – direkt von mir.</p>
        </header>
        <BlogIndex posts={posts} searchTexts={searchTexts} pastIds={pastIds} />
      </div>
    </main>
  );
}
