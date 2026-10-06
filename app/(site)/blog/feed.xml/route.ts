import { listPublishedPosts } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 300;

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = (await listPublishedPosts()).slice(0, 30);

  const items = posts
    .map(
      (post) => `    <item>
      <title>${esc(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${esc(post.excerpt)}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE_NAME)} – Aktuelles</title>
    <link>${SITE_URL}/blog</link>
    <description>Neuigkeiten, Ankündigungen und Events von ${esc(SITE_NAME)}.</description>
    <language>de-DE</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
