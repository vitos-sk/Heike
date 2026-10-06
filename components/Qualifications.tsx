import {
  BriefcaseMedical,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Heart,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { qualifications } from "@/lib/placeholder-data";

const sealIcons: LucideIcon[] = [Stethoscope, ClipboardCheck, GraduationCap];
const entryIcons: LucideIcon[] = [BriefcaseMedical, Heart, Compass];

export default function Qualifications() {
  return (
    <section id="qualifications" className="sec ql" aria-labelledby="ql-h">
      <div className="wrap">
        <div className="ql-grid">
          <div className="ql-l">
            <h2 className="t-h2 rv" id="ql-h">
              {qualifications.heading}
            </h2>
            <p className="t-body rv" style={{ ["--d" as string]: ".05s" }}>
              {qualifications.intro}
            </p>
            <ul className="ql-seals rv" aria-label={qualifications.training.heading}>
              {qualifications.training.items.map((item, i) => {
                const Icon = sealIcons[i];
                return (
                  <li key={item}>
                    <span className="sl">
                      <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="ql-r">
            {qualifications.sections.map((section, i) => {
              const Icon = entryIcons[i];
              return (
                <div className="ql-e rv" key={section.title}>
                  <span className="ico">
                    <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{section.title}</h3>
                    <p>{section.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
