import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Section = { title: string; lines: readonly string[] };

export default function LegalPage({
  heading,
  sections,
}: {
  heading: string;
  sections: readonly Section[];
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
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
