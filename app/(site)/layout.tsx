import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { listLatestPosts } from "@/lib/posts";
import RevealObserver from "@/components/RevealObserver";
import "../blocks.css";
import "../blog.css";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Gleiche Bedingung wie beim Bereich „Aktuelles“ auf der Startseite.
  const hasNews = (await listLatestPosts(3)).length > 0;

  return (
    <>
      <a className="skip" href="#main">
        Zum Inhalt springen
      </a>
      <Header hasNews={hasNews} />
      {children}
      <Footer />
      <RevealObserver />
    </>
  );
}
