const SLUG_MAX_LENGTH = 80;

// Deutsche Umlaute vor der Normalisierung ersetzen: "ä" würde sonst zu "a"
// statt zum lesbareren "ae" werden.
const TRANSLITERATIONS: Array<[RegExp, string]> = [
  [/ä/g, "ae"],
  [/ö/g, "oe"],
  [/ü/g, "ue"],
  [/ß/g, "ss"],
];

// Kombinierende Akzente (z. B. aus "é" nach NFD), die entfernt statt zu "-"
// umgewandelt werden sollen.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugify(title: string): string {
  let slug = title.toLowerCase();

  for (const [pattern, replacement] of TRANSLITERATIONS) {
    slug = slug.replace(pattern, replacement);
  }

  return slug
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-$/, "");
}
