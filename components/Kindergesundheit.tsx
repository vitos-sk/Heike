import Image from "next/image";
import { Ear, Footprints, Heart, Puzzle } from "lucide-react";
import { kindergesundheit } from "@/lib/placeholder-data";

const icons = [Ear, Puzzle, Footprints];

export default function Kindergesundheit() {
  return (
    <section
      id="kindergesundheit"
      className="sec kg on-dark"
      aria-labelledby="kg-h"
    >
      <Image
        className="kg-wm"
        src="/logo.png"
        alt=""
        width={788}
        height={771}
        sizes="(min-width: 900px) 44rem, 62vw"
        aria-hidden="true"
      />
      <div className="wrap">
        <h2 className="t-h2 kg-h rv" id="kg-h">
          {kindergesundheit.heading}
        </h2>

        <div className="kg-cols">
          {kindergesundheit.paragraphs.map((text, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className="kg-col rv"
                style={{ ["--d" as string]: `${i * 0.1}s` }}
              >
                <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
                <p>{text}</p>
              </div>
            );
          })}
        </div>

        <div className="kg-q rv">
          <h3>
            <Heart className="ic" strokeWidth={1.6} aria-hidden="true" />
            {kindergesundheit.quoteCard.heading}
          </h3>
          <p>{kindergesundheit.quoteCard.text}</p>
        </div>
      </div>
    </section>
  );
}
