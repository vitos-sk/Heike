import Image from "next/image";
import { about } from "@/lib/placeholder-data";

// Текст Хайке дословно, режется на главы по абзацам (\n\n).
// Заголовки глав — UI-текст, предложен в design-lab и ждёт подтверждения.
const chapters: { title: string; year?: boolean; paragraphs: number[] }[] = [
  { title: "Familie", paragraphs: [0] },
  { title: "In Bewegung", paragraphs: [1] },
  { title: "2021", year: true, paragraphs: [2, 3] },
  { title: "Mein Blick auf Gesundheit", paragraphs: [4, 5] },
];

export default function About() {
  const paras = about.text.split("\n\n");

  return (
    <section id="about" className="sec ab" aria-labelledby="ab-h">
      <div className="wrap">
        <h2 className="t-h2 ab-top rv" id="ab-h">
          {about.heading}
        </h2>
        <div className="ab-grid">
          <figure className="ab-pic">
            <div className="im">
              <Image
                src={about.photo}
                alt="Heike formt mit den Händen ein Herz, neben ihr sitzt ihr Hund am Strand"
                fill
                sizes="(min-width: 900px) 30rem, 100vw"
              />
            </div>
            <figcaption>Draußen kann ich neue Energie tanken.</figcaption>
          </figure>

          <div className="ab-read">
            {chapters.map((ch) => (
              <div className="ab-ch" key={ch.title}>
                <h3 className={ch.year ? "yr" : undefined}>{ch.title}</h3>
                {ch.paragraphs.map((idx) => (
                  <p key={idx}>{paras[idx]}</p>
                ))}
              </div>
            ))}
            <p className="ab-q">{about.quote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
