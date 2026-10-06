import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import "../blocks.css";
import "../blog.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">
        Zum Inhalt springen
      </a>
      <Header />
      {children}
      <Footer />
      <RevealObserver />
    </>
  );
}
