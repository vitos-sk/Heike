import Image from "next/image";
import { Apple, ArrowRight, Heart, Sprout, Stethoscope } from "lucide-react";
import { hero } from "@/lib/placeholder-data";

const creds = [
  { icon: Stethoscope, label: "Examinierte Kinderkrankenschwester" },
  { icon: Apple, label: "Ernährungsberatung" },
  { icon: Sprout, label: "Gesundheitscoaching" },
];

const ACCENT = "gut anfühlen.";

export default function Hero() {
  const i = hero.heading.indexOf(ACCENT);
  const before = i >= 0 ? hero.heading.slice(0, i) : hero.heading;
  const accent = i >= 0 ? ACCENT : "";

  return (
    <section id="home" className="hero">
      <div className="wrap hero-grid">
        <div className="hero-txt">
          <h1 className="t-h1">
            {before}
            {accent && <em>{accent}</em>}
          </h1>
          <p className="t-lead">{hero.subheading}</p>
          <div className="hero-cta">
            <a className="btn" href="#contact">
              {hero.ctaText}
              <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
            </a>
            <a className="btn btn--ghost" href="#about">
              Mehr über mich
            </a>
          </div>
          <ul className="hero-creds">
            {creds.map(({ icon: Icon, label }) => (
              <li key={label}>
                <span className="ico">
                  <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <figure className="hero-fig">
          <div className="hero-arch">
            <Image
              src="/heike-portrait.png"
              alt={hero.portraitName}
              fill
              priority
              sizes="(min-width: 900px) 27rem, 18rem"
            />
          </div>
          <figcaption className="hero-chip">
            <span className="h">
              <Heart className="ic" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <span>
              <b>{hero.portraitName}</b>
              <span>{hero.portraitTagline}</span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
