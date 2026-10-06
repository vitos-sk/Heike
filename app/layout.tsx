import type { Metadata, Viewport } from "next";
import { Figtree, Young_Serif } from "next/font/google";
import { siteMeta } from "@/lib/placeholder-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import "./globals.css";
import "./blocks.css";

const display = Young_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteMeta.title,
  description: siteMeta.description,
};

export const viewport: Viewport = {
  themeColor: "#F7F3EB",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Метка «JS есть»: без неё контент остаётся полностью видимым */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <a className="skip" href="#main">
          Zum Inhalt springen
        </a>
        <Header />
        {children}
        <Footer />
        <RevealObserver />
      </body>
    </html>
  );
}
