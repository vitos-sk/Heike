// Angaben für Impressum und Datenschutzerklärung (bewusst knapp gehalten).
// Leere Felder werden auf den Seiten einfach weggelassen. Fehlende Pflichtangaben
// (Anschrift) zeigt der Admin in der Übersicht als Hinweis an.

export const owner = {
  name: "Heike Schaub",
  // Ladungsfähige Anschrift (kein Postfach). Sobald ausgefüllt, erscheint sie automatisch
  // im Impressum und in der Datenschutzerklärung.
  street: "",
  zip: "",
  city: "",
  phone: "0173 7214830",
  email: "Schaub-heike@gmx.de",
  // Nur ausfüllen, wenn vorhanden (sonst leer lassen):
  vatId: "",
  // Zuständige Datenschutz-Aufsichtsbehörde (Wohnort Baden-Württemberg)
  authority: "Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg, Stuttgart",
  // Wer hat die Fotos / das Logo gemacht? Leer lassen, wenn alles von Heike selbst ist.
  imageCredits: "",
};

export const LEGAL_STAND = "November 2026";

/** Welche Pflichtangaben fehlen noch? (für den Hinweis im Admin) */
export function missingLegalFields(): string[] {
  const missing: string[] = [];
  if (!owner.street.trim()) missing.push("Straße und Hausnummer");
  if (!owner.zip.trim()) missing.push("PLZ");
  if (!owner.city.trim()) missing.push("Ort");
  return missing;
}

export type LegalSection = { title: string; lines: string[]; list?: string[] };

/** Name und – soweit angegeben – Anschrift, jeweils eine Zeile pro Teil. */
function addressLines(): string[] {
  const place = `${owner.zip.trim()} ${owner.city.trim()}`.trim();
  return [owner.name, owner.street.trim(), place].filter(Boolean);
}

/** Anschrift in einer Zeile (für Fließtext). */
function addressInline(): string {
  return addressLines().join(", ");
}

export function impressumSections(): LegalSection[] {
  const hasAddress = Boolean(owner.street.trim() && owner.city.trim());

  const sections: LegalSection[] = [
    {
      title: "Angaben gemäß § 5 DDG",
      lines: hasAddress ? [...addressLines(), "Deutschland"] : addressLines(),
    },
    {
      title: "Kontakt",
      lines: [`Telefon: ${owner.phone}`, `E-Mail: ${owner.email}`],
    },
  ];

  if (owner.vatId.trim()) {
    sections.push({
      title: "Umsatzsteuer-ID",
      lines: [`Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: ${owner.vatId.trim()}`],
    });
  }

  sections.push(
    {
      title: "Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV",
      lines: [owner.name],
    },
    {
      title: "Hinweis zu Lifeplus",
      lines: [
        "Ich bin selbstständige, unabhängige Lifeplus Partnerin. Links zu meinem Lifeplus-Shop sind Werbelinks: Bestellen Sie darüber, kommt der Kaufvertrag mit Lifeplus zustande, nicht mit mir, und ich erhalte gegebenenfalls eine Vergütung.",
      ],
    },
  );

  if (owner.imageCredits.trim()) {
    sections.push({ title: "Bildnachweis", lines: [owner.imageCredits.trim()] });
  }

  return sections;
}

export function datenschutzSections(): LegalSection[] {
  return numbered(rawDatenschutz());
}

// Nummeriert die Abschnitte automatisch, damit beim Streichen nichts durcheinanderkommt.
function numbered(sections: LegalSection[]): LegalSection[] {
  return sections.map((section) => {
    if (section.title === "Stand") return section;
    const index = sections.filter((s) => s.title !== "Stand").indexOf(section);
    return { ...section, title: `${index + 1}. ${section.title}` };
  });
}

function rawDatenschutz(): LegalSection[] {
  return [
    {
      title: "Verantwortliche",
      lines: [
        `Verantwortlich für die Datenverarbeitung auf dieser Website ist ${addressInline()}. Telefon: ${owner.phone}, E-Mail: ${owner.email}.`,
        "Ich verarbeite personenbezogene Daten nur, soweit das nötig ist, und nach den Vorgaben der Datenschutz-Grundverordnung (DSGVO). Es werden keine Cookies, keine Analyse- und Tracking-Dienste und keine Werbenetzwerke eingesetzt.",
      ],
    },
    {
      title: "Hosting und Dienstleister",
      lines: [
        "Ich nutze die folgenden Dienstleister. Mit allen besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO). Soweit Daten in die USA übermittelt werden, geschieht das auf Grundlage des EU-US Data Privacy Framework oder von EU-Standardvertragsklauseln (Art. 45, 46 DSGVO).",
      ],
      list: [
        "Vercel Inc., USA – Hosting der Website. Beim Aufruf verarbeitet der Anbieter technisch notwendige Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser und Betriebssystem), um die Seiten auszuliefern und die Sicherheit zu gewährleisten. Sie werden nach kurzer Zeit gelöscht. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.",
        "Supabase Inc., USA – Datenbank für Nachrichten aus dem Kontaktformular sowie für Blog-Beiträge und Bilder. Die Nachrichten sind nur für mich im geschützten Verwaltungsbereich sichtbar.",
        "Resend, Inc., USA – E-Mail-Versand, zum Beispiel die Benachrichtigung an mich über eine neue Nachricht und meine Antworten an Sie.",
      ],
    },
    {
      title: "Kontaktformular",
      lines: [
        "Wenn Sie mir über das Kontaktformular schreiben, verarbeite ich Ihren Namen, Ihre E-Mail-Adresse, Ihre Nachricht sowie Datum und Uhrzeit, ausschließlich um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anfrage im Zusammenhang mit einer Beratung), sonst lit. f (berechtigtes Interesse, Anfragen zu beantworten). Ohne diese Angaben kann ich Ihre Anfrage nicht beantworten.",
        "Ich lösche Ihre Nachricht, sobald die Anfrage erledigt ist und keine gesetzliche Aufbewahrungspflicht besteht.",
        "Wenn Sie ankreuzen, dass Sie die Reflexionsfragen erhalten möchten, schicke ich sie Ihnen per E-Mail. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit mit Wirkung für die Zukunft widerrufen können. Einen Newsletter oder Werbung erhalten Sie nicht.",
        "Bitte schreiben Sie im Formular keine ausführlichen Gesundheitsangaben zu sich oder Ihren Kindern. Teilen Sie mir solche Angaben dennoch mit, verarbeite ich sie nur zur Beantwortung Ihrer Anfrage, auf Grundlage Ihrer ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO).",
      ],
    },
    {
      title: "Schutz vor Missbrauch",
      lines: [
        "Damit das Kontaktformular nicht durch automatisierte Massenanfragen missbraucht wird, speichere ich kurzzeitig eine Kennung Ihrer IP-Adresse (Hashwert, nicht die IP-Adresse selbst) und lösche sie automatisch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Sicherheit der Website).",
      ],
    },
    {
      title: "Cookies und Schriftarten",
      lines: [
        "Für Besucherinnen und Besucher setzt diese Website keine Cookies. Der Verwaltungsbereich, der nur für mich zugänglich ist, nutzt ein technisch notwendiges Anmelde-Cookie (§ 25 Abs. 2 Nr. 2 TDDDG). Die Schriftarten werden von meinem eigenen Server ausgeliefert; es wird keine Verbindung zu Google aufgebaut.",
      ],
    },
    {
      title: "Ihre Rechte und Beschwerde",
      lines: [
        "Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–18, 20, 21 DSGVO) sowie auf Widerruf einer Einwilligung (Art. 7 Abs. 3 DSGVO). Eine kurze Nachricht an die oben genannte E-Mail-Adresse genügt.",
        `Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO). Für mich zuständig ist: ${owner.authority}.`,
        "Eine automatisierte Entscheidungsfindung oder ein Profiling findet nicht statt.",
      ],
    },
    {
      title: "Stand",
      lines: [`Stand dieser Datenschutzerklärung: ${LEGAL_STAND}.`],
    },
  ];
}
