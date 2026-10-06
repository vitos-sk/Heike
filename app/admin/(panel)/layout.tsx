import AdminShell from "@/components/admin/AdminShell";
import { listSubmissions } from "@/lib/submissions";
import { listPosts } from "@/lib/posts";
import { getAdminAccount } from "@/lib/adminAccount";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // Zähler in der Navigation: ein Datenbankfehler soll nur die Zähler leeren,
  // die Seite selbst meldet das Problem verständlich (error.tsx).
  const [submissions, posts, account] = await Promise.all([
    listSubmissions().catch(() => []),
    listPosts().catch(() => []),
    getAdminAccount().catch(() => null),
  ]);

  const unread = submissions.filter((s) => s.status === "new").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <AdminShell unread={unread} drafts={drafts} email={account?.email ?? ""}>
      {children}
    </AdminShell>
  );
}
