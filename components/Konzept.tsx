import { Droplets, Footprints, Moon, Salad, Sprout, type LucideIcon } from "lucide-react";
import { konzept } from "@/lib/placeholder-data";

// Координаты узлов — в % от квадрата схемы (viewBox 100)
const nodes: { label: string; icon: LucideIcon; x: number; y: number }[] = [
  { label: "Bewusste Ernährung", icon: Salad, x: 50, y: 14 },
  { label: "Mikro­nährstoffe", icon: Droplets, x: 84.2, y: 38.9 },
  { label: "Bewegung", icon: Footprints, x: 71.2, y: 79.1 },
  { label: "Regeneration", icon: Moon, x: 28.8, y: 79.1 },
  { label: "Persönliche Entwicklung", icon: Sprout, x: 15.8, y: 38.9 },
];

export default function Konzept() {
  return (
    <section id="konzept" className="sec kz" aria-labelledby="kz-h">
      <div className="wrap">
        <div className="kz-grid">
          <div className="kz-txt">
            <h2 className="t-h2 rv" id="kz-h">
              {konzept.heading}
            </h2>
            <p className="kz-sub rv" style={{ ["--d" as string]: ".05s" }}>
              {konzept.subheading}
            </p>
            {konzept.paragraphs.map((text, i) => (
              <p
                key={i}
                className="t-body rv"
                style={{ ["--d" as string]: `${0.1 + i * 0.05}s` }}
              >
                {text}
              </p>
            ))}
          </div>

          <div className="kz-fig rv">
            <div
              className="orb"
              role="img"
              aria-label="Der Mensch steht im Mittelpunkt: Bewusste Ernährung, Mikronährstoffe, Bewegung, Regeneration und persönliche Entwicklung greifen ineinander"
            >
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="ring" cx="50" cy="50" r="36" />
                {nodes.map((n) => (
                  <line key={n.label} className="ln" x1="50" y1="50" x2={n.x} y2={n.y} />
                ))}
              </svg>
              <div className="core">
                <div>
                  <b>Du</b>
                  <small>im Mittelpunkt</small>
                </div>
              </div>
              {nodes.map(({ label, icon: Icon, x, y }) => (
                <span key={label} className="nd" style={{ left: `${x}%`, top: `${y}%` }}>
                  <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
            <p className="kz-cap">{konzept.quote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
