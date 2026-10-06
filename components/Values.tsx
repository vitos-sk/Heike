import { values } from "@/lib/placeholder-data";

// Форма «камешка» по порядку значений (стили s1–s6 из макета 08-values.html)
const shapes = ["s1", "s3", "s4", "s2", "s5", "s6"];

export default function Values() {
  return (
    <section id="values" className="sec val" aria-labelledby="val-h">
      <div className="wrap">
        <div className="val-head">
          <h2 className="t-h2 rv" id="val-h">
            {values.heading}
          </h2>
        </div>
        <ul className="val-cloud">
          {values.items.map((item, i) => (
            <li
              key={item}
              className={`pb ${shapes[i % shapes.length]} rv`}
              style={{ ["--d" as string]: `${i * 0.05}s` }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
