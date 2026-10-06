import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/impressum`, priority: 0.2 },
    { url: `${SITE_URL}/datenschutz`, priority: 0.2 },
  ];
}
