import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LegalSection } from "@/lib/legal";

// E-Mail-Adressen und Web-Adressen im Text werden zu Links.
const LINK_PATTERN = /(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

function Linked({ text }: { text: string }) {
  const parts = text.split(LINK_PATTERN);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        if (part.includes("@") && !part.startsWith("http")) return <a key={i} href={`mailto:${part}`}>{part}</a>;
        const url = part.replace(/[.,;)]+$/, "");
        return (
          <Fragment key={i}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </a>
            {part.slice(url.length)}
          </Fragment>
        );
      })}
    </>
  );
}

export default function LegalPage({
  heading,
  sections,
}: {
  heading: string;
  sections: readonly LegalSection[];
}) {
  return (
    <main id="main" className="legal">
      <div className="wrap legal-in">
        <Link href="/" className="legal-back">
          <ArrowLeft className="ic" strokeWidth={1.6} aria-hidden="true" />
          Zurück zur Startseite
        </Link>

        <h1 className="t-h1">{heading}</h1>

        <div className="legal-secs">
          {sections.map((section) => (
            <section key={section.title} className="legal-sec">
              <h2>{section.title}</h2>
              <div>
                {section.lines.map((line, i) => (
                  <p key={i}>
                    <Linked text={line} />
                  </p>
                ))}
                {section.list && (
                  <ul>
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
