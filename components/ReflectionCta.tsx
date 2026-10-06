"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, Lightbulb } from "lucide-react";
import { reflection } from "@/lib/placeholder-data";

const total = reflection.questions.length;

export default function ReflectionCta() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1 | 0>(0);
  const startX = useRef<number | null>(null);

  const go = (n: number, d: 1 | -1) => {
    setDir(d);
    setIndex((n + total) % total);
  };

  const tip = reflection.tip.text.split("\n\n");

  return (
    <section id="reflexionsfragen" className="sec rf" aria-labelledby="rf-h">
      <div className="wrap">
        <div className="rf-grid">
          <div className="rf-txt">
            <h2 className="t-h2 rv" id="rf-h">
              {reflection.heading}
            </h2>
            {reflection.intro.map((text, i) => (
              <p key={i} className="t-body rv">
                {text}
              </p>
            ))}
            <a className="btn rv" href="#contact">
              {reflection.buttonText}
              <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
            </a>
          </div>

          <div>
            {/* Все 7 вопросов всегда в DOM: без JS виден как список, с JS — только для скринридеров и поисковиков */}
            <ol className="rf-list sr-only-js" aria-label="Alle sieben Reflexionsfragen">
              {reflection.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>

            <div className="rf-deck rv">
              <div
                className="rf-card"
                onPointerDown={(e) => {
                  startX.current = e.clientX;
                }}
                onPointerUp={(e) => {
                  if (startX.current === null) return;
                  const dx = e.clientX - startX.current;
                  startX.current = null;
                  if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
                }}
                onPointerCancel={() => {
                  startX.current = null;
                }}
              >
                <div className="rf-top">
                  <span>
                    <Heart className="ic" strokeWidth={1.6} aria-hidden="true" />
                    {reflection.eyebrow}
                  </span>
                  <span>
                    Frage {index + 1} von {total}
                  </span>
                </div>
                <p
                  key={index}
                  className={`rf-q${dir === 1 ? " go-next" : dir === -1 ? " go-prev" : ""}`}
                  aria-live="polite"
                >
                  {reflection.questions[index]}
                </p>
                <div className="rf-nav">
                  <div className="rf-dots" aria-hidden="true">
                    {reflection.questions.map((_, i) => (
                      <i key={i} className={i === index ? "on" : undefined} />
                    ))}
                  </div>
                  <div className="rf-btns">
                    <button
                      type="button"
                      aria-label="Vorherige Frage"
                      onClick={() => go(index - 1, -1)}
                    >
                      <ArrowLeft className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Nächste Frage"
                      onClick={() => go(index + 1, 1)}
                    >
                      <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rf-tip rv">
              <Lightbulb className="ic" strokeWidth={1.6} aria-hidden="true" />
              <div>
                <h3>{reflection.tip.heading}</h3>
                {tip.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
