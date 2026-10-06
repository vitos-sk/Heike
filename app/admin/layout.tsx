import type { Metadata } from "next";
import "../blog.css";
import "../admin.css";

export const metadata: Metadata = {
  title: { default: "Verwaltung", template: "%s · Verwaltung" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm-root">{children}</div>;
}
