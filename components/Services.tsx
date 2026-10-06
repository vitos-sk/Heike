"use client";

import { useState } from "react";
import {
  ArrowRight,
  Baby,
  Compass,
  Handshake,
  Plus,
  Salad,
  ShieldCheck,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { services } from "@/lib/placeholder-data";

// Иконки и действия — по порядку услуг в lib/placeholder-data.ts
const meta: { icon: LucideIcon; cta: string; href: string }[] = [
  { icon: Compass, cta: "Gespräch vereinbaren", href: "#contact" },
  { icon: Salad, cta: "Gespräch vereinbaren", href: "#contact" },
  { icon: Baby, cta: "Mehr zur Kindergesundheit", href: "#kindergesundheit" },
  { icon: ShieldCheck, cta: "Gespräch vereinbaren", href: "#contact" },
  { icon: Sun, cta: "Mein Konzept ansehen", href: "#konzept" },
  { icon: Handshake, cta: "Gespräch vereinbaren", href: "#contact" },
];

export default function Services() {
  const [active, setActive] = useState(0);
  const current = services.items[active];
  const CurrentIcon = meta[active].icon;

  // На десктопе панель справа меняется при наведении
  const hover = (i: number) => {
    if (window.matchMedia("(min-width: 900px)").matches) setActive(i);
  };

  return (
    <section id="services" className="sec svc" aria-labelledby="svc-h">
      <div className="wrap">
        <div className="svc-head">
          <h2 className="t-h2 rv" id="svc-h">
            {services.heading}
          </h2>
          <p className="t-lead rv" style={{ ["--d" as string]: ".1s" }}>
            {services.subheading}
          </p>
        </div>

        <div className="svc-wrap">
          <ul className="svc-list">
            {services.items.map((item, i) => {
              const { cta, href } = meta[i];
              const on = i === active;
              return (
                <li key={item.title} className={`svc-item${on ? " on" : ""}`}>
                  <button
                    type="button"
                    className="svc-btn"
                    aria-expanded={on}
                    aria-controls={`svc-d-${i}`}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => hover(i)}
                    onFocus={() => hover(i)}
                  >
                    {item.title}
                    <Plus className="ic" strokeWidth={1.6} aria-hidden="true" />
                  </button>
                  <div className="svc-d" id={`svc-d-${i}`}>
                    <p className="t-body">{item.description}</p>
                    <a className="btn" href={href}>
                      {cta}
                      <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="svc-panel" aria-live="polite">
            <div className="swap" key={active}>
              <span className="big">
                <CurrentIcon className="ic" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <h3 className="t-h3">{current.title}</h3>
              <p className="t-body">{current.description}</p>
              <a className="btn" href={meta[active].href}>
                {meta[active].cta}
                <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
