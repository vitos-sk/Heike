import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostBody from "@/components/blog/PostBody";
import PostHeader from "@/components/blog/PostHeader";
import PostCard from "@/components/blog/PostCard";
import ShareButtons from "@/components/blog/ShareButtons";
import { getPostBySlug, isPastEvent, listPublishedPosts } from "@/lib/posts";
import { readingTimeMinutes } from "@/lib/postContent";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 300;

type Props = { params: { slug: string }; searchParams: { preview?: string } };

async function isAdminPreview(preview: string | undefined): Promise<boolean> {
  if (preview !== "1") return false;
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

async function loadPost(slug: string, preview: boolean) {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  const live = post.status === "published" && post.publishedAt <= Date.now();
  return live || preview ? post : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const preview = await isAdminPreview(searchParams.preview);
  const post = await loadPost(params.slug, preview);
  if (!post) return { title: "Nicht gefunden" };

  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: preview ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      url,
      siteName: SITE_NAME,
      publishedTime: new Date(post.publishedAt).toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.coverImageAlt }] : undefined,
    },
    twitter: { card: post.coverImageUrl ? "summary_large_image" : "summary" },
  };
}

export default async function PostPage({ params, searchParams }: Props) {
  const preview = await isAdminPreview(searchParams.preview);
  const post = await loadPost(params.slug, preview);
  if (!post) notFound();

  const url = `${SITE_URL}/blog/${post.slug}`;
  const related = (await listPublishedPosts()).filter((p) => p.id !== post.id && !isPastEvent(p)).slice(0, 3);
  const isDraft = post.status !== "published" || post.publishedAt > Date.now();

  const jsonLd =
    post.type === "event" && post.eventDate
      ? {
          "@context": "https://schema.org",
          "@type": "Event",
          name: post.title,
          description: post.excerpt || undefined,
          startDate: post.eventTime ? `${post.eventDate}` : post.eventDate,
          location: post.eventLocation ? { "@type": "Place", name: post.eventLocation } : undefined,
          image: post.coverImageUrl ?? undefined,
          url,
        }
      : {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || undefined,
          datePublished: new Date(post.publishedAt).toISOString(),
          dateModified: new Date(post.updatedAt).toISOString(),
          image: post.coverImageUrl ?? undefined,
          author: { "@type": "Person", name: SITE_NAME },
          mainEntityOfPage: url,
        };

  return (
    <main id="main" className="blog">
      <article className="pb-article">
        {preview && isDraft && (
          <p className="pb-banner" role="status">
            Vorschau – dieser Beitrag ist noch nicht öffentlich sichtbar.
          </p>
        )}
        <Link href="/blog" className="legal-back">
          <ArrowLeft className="ic" strokeWidth={1.6} aria-hidden="true" />
          Alle Beiträge
        </Link>
        <PostHeader post={post} readingMinutes={readingTimeMinutes(post.blocks)} />
        <PostBody blocks={post.blocks} />
        <footer className="pb-foot">
          <ShareButtons url={url} title={post.title} />
        </footer>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </article>

      {related.length > 0 && (
        <section className="wrap pb-related" aria-labelledby="rel-h">
          <h2 className="t-h3" id="rel-h">
            Weitere Beiträge
          </h2>
          <div className="news-grid">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
