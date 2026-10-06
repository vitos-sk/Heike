import { notFound } from "next/navigation";
import PostForm from "@/components/admin/PostForm";
import { getPost } from "@/lib/posts";

export const metadata = { title: "Beitrag bearbeiten" };

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id).catch(() => null);
  if (!post) notFound();
  return <PostForm initialPost={post} />;
}
