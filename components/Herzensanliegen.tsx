import Image from "next/image";
import { herzensanliegen } from "@/lib/placeholder-data";

export default function Herzensanliegen() {
  return (
    <section className="sec hz" aria-labelledby="hz-h">
      <div className="wrap">
        <div className="hz-grid">
          <div className="hz-pic rv">
            <svg className="hz-rings" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="44" />
              <circle cx="50" cy="50" r="48" />
            </svg>
            <div className="hz-disc">
              <Image
                src="/heike-beach.png"
                alt="Heike formt mit den Händen ein Herz"
                fill
                sizes="(min-width: 900px) 26rem, 22rem"
              />
            </div>
          </div>
          <div className="hz-txt">
            <h2 className="t-h2 rv" id="hz-h">
              {herzensanliegen.heading}
            </h2>
            <p className="t-body rv" style={{ ["--d" as string]: ".1s" }}>
              {herzensanliegen.text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
