// Angaben für Impressum und Datenschutzerklärung.
// Leere Felder erscheinen auf den Seiten als „[Platzhalter]“ und werden im Admin
// (Übersicht) als Hinweis angezeigt – die Website sollte erst veröffentlicht werden,
// wenn nichts mehr fehlt.

export const owner = {
  name: "Heike Schaub",
  // Pflicht (ladungsfähige Anschrift, kein Postfach):
  street: "",
  zip: "",
  city: "",
  phone: "0173 7214830",
  email: "Schaub-heike@gmx.de",
  // Nur ausfüllen, wenn vorhanden (sonst leer lassen):
  vatId: "",
  // Zuständige Datenschutz-Aufsichtsbehörde des Bundeslandes, z. B.
  // „Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz“
  authority: "",
  // Wer hat die Fotos / das Logo gemacht? Leer lassen, wenn alles von Heike selbst ist.
  imageCredits: "",
};

export const LEGAL_STAND = "Oktober 2026";

const ph = (value: string, label: string) => (value.trim() ? value.trim() : `[${label}]`);

/** Welche Pflichtangaben fehlen noch? (für den Hinweis im Admin) */
export function missingLegalFields(): string[] {
  const missing: string[] = [];
  if (!owner.street.trim()) missing.push("Straße und Hausnummer");
  if (!owner.zip.trim()) missing.push("PLZ");
  if (!owner.city.trim()) missing.push("Ort");
  if (!owner.authority.trim()) missing.push("Datenschutz-Aufsichtsbehörde");
  return missing;
}

export type LegalSection = { title: string; lines: string[]; list?: string[] };

const address = () => [
  owner.name,
  ph(owner.street, "Straße und Hausnummer"),
  `${ph(owner.zip, "PLZ")} ${ph(owner.city, "Ort")}`,
];

export function impressumSections(): LegalSection[] {
  const sections: LegalSection[] = [
    {
      title: "Angaben gemäß § 5 DDG",
      lines: [...address(), "Deutschland"],
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
      lines: address(),
    },
    {
      title: "Hinweis zu Lifeplus",
      lines: [
        "Ich bin selbstständige, unabhängige Lifeplus Partnerin und nicht Angestellte der Lifeplus-Unternehmen. Meine Beratung und die Inhalte dieser Website sind meine eigenen.",
        "Links zu meinem Lifeplus-Shop sind Werbelinks. Wenn Sie über diese Links bestellen, kommt der Kaufvertrag mit Lifeplus zustande, nicht mit mir. Für vermittelte Bestellungen erhalte ich gegebenenfalls eine Vergütung.",
      ],
    },
    {
      title: "Hinweis zur Gesundheit",
      lines: [
        "Meine Inhalte und Beratungen ersetzen keine ärztliche Diagnose oder Behandlung. Bei gesundheitlichen Beschwerden wenden Sie sich bitte an eine Ärztin oder einen Arzt.",
      ],
    },
    {
      title: "Verbraucherstreitbeilegung",
      lines: [
        "Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      ],
    },
    {
      title: "Haftung für Inhalte und Links",
      lines: [
        "Ich erstelle die Inhalte dieser Website mit großer Sorgfalt. Für die Richtigkeit, Vollständigkeit und Aktualität kann ich jedoch keine Gewähr übernehmen.",
        "Diese Website enthält Links zu externen Websites Dritter (zum Beispiel Facebook, Instagram und Lifeplus), auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte ist stets der jeweilige Anbieter verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Sobald mir solche bekannt werden, entferne ich die Links umgehend.",
      ],
    },
    {
      title: "Urheberrecht",
      lines: [
        "Die Texte, Bilder und sonstigen Inhalte dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen meiner schriftlichen Zustimmung.",
        ...(owner.imageCredits.trim() ? [`Bildnachweis: ${owner.imageCredits.trim()}`] : []),
      ],
    },
  );

  return sections;
}

export function datenschutzSections(): LegalSection[] {
  const contactLine = `${owner.name}, ${ph(owner.street, "Straße und Hausnummer")}, ${ph(owner.zip, "PLZ")} ${ph(owner.city, "Ort")}`;
  const authority = ph(owner.authority, "zuständige Datenschutz-Aufsichtsbehörde");

  return [
    {
      title: "1. Verantwortliche und Überblick",
      lines: [
        `Verantwortlich für die Datenverarbeitung auf dieser Website ist: ${contactLine}. Telefon: ${owner.phone}, E-Mail: ${owner.email}.`,
        "Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. Ich verarbeite sie nur, soweit das nötig ist, und nur so, wie es die Datenschutz-Grundverordnung (DSGVO) und das Telekommunikation-Digitale-Dienste-Datenschutz-Gesetz (TDDDG) erlauben. Diese Erklärung zeigt, welche Daten wann anfallen und was mit ihnen geschieht.",
        "Diese Website verwendet für Besucherinnen und Besucher keine Cookies, keine Analyse- und keine Tracking-Dienste, und es werden keine Werbenetzwerke eingebunden.",
      ],
    },
    {
      title: "2. Hosting und Server-Logfiles",
      lines: [
        "Diese Website wird bei Vercel Inc., USA (vercel.com) betrieben. Beim Aufruf der Seiten verarbeitet der Anbieter technisch notwendige Daten, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp und -version, Betriebssystem und die zuvor besuchte Seite (Referrer). Diese Daten sind notwendig, um die Seiten auszuliefern, die Stabilität und Sicherheit zu gewährleisten und Angriffe abzuwehren. Sie werden nicht mit anderen Daten zusammengeführt und nach kurzer Zeit gelöscht.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einem sicheren und zuverlässigen Betrieb der Website). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO). Vercel ist unter dem EU-US Data Privacy Framework zertifiziert; ergänzend gelten die EU-Standardvertragsklauseln (Art. 46 DSGVO).",
      ],
    },
    {
      title: "3. Kontaktformular und Nachrichten",
      lines: [
        "Wenn Sie mir über das Kontaktformular schreiben, verarbeite ich die Angaben, die Sie eingeben: Name, E-Mail-Adresse und Ihre Nachricht, außerdem Datum und Uhrzeit der Anfrage und – falls Sie es ankreuzen – den Wunsch, die 7 Reflexionsfragen zu erhalten. Ich nutze diese Daten ausschließlich, um Ihre Anfrage zu beantworten.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, wenn Ihre Anfrage mit einem Vertrag oder vorvertraglichen Maßnahmen zusammenhängt, sonst Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse, Anfragen zu beantworten). Mit dem Häkchen bei der Datenschutzerklärung bestätigen Sie, dass Sie diese gelesen haben. Die Angabe ist freiwillig; ohne sie kann ich Ihre Anfrage allerdings nicht beantworten.",
        "Speicherdauer: Ich lösche Ihre Nachricht, sobald Ihre Anfrage abschließend bearbeitet ist und die Daten nicht mehr gebraucht werden, in der Regel spätestens 12 Monate danach. Gesetzliche Aufbewahrungspflichten (zum Beispiel für Geschäftsbriefe nach Handels- und Steuerrecht) bleiben unberührt.",
      ],
    },
    {
      title: "4. Gesundheitsdaten – bitte sparsam sein",
      lines: [
        "Bitte schreiben Sie im Kontaktformular keine ausführlichen Angaben zu Ihrer Gesundheit oder der Ihrer Kinder. Solche Angaben sind besonders geschützt (Art. 9 DSGVO). Wenn Sie mir dennoch Gesundheitsdaten mitteilen, geschieht das freiwillig und ich verarbeite sie ausschließlich, um Ihre Anfrage zu beantworten. Rechtsgrundlage ist dann Ihre ausdrückliche Einwilligung (Art. 9 Abs. 2 lit. a DSGVO). Sie können sie jederzeit widerrufen.",
      ],
    },
    {
      title: "5. Datenbank (Speicherung der Nachrichten)",
      lines: [
        "Ihre Nachricht wird in einer Datenbank gespeichert, die ich über den Anbieter Supabase Inc., USA (supabase.com) nutze. Die Daten liegen auf Servern in den USA (Rechenzentrum Nord-Virginia). Sie sind nur für mich im geschützten Verwaltungsbereich sichtbar. Mit Supabase besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO). Die Übermittlung in die USA stützt sich auf die EU-Standardvertragsklauseln (Art. 46 DSGVO).",
        "Ebenfalls dort liegen die Beiträge meines Blogs und die dazugehörigen Bilder. Diese Inhalte sind öffentlich gedacht und enthalten keine Daten von Besucherinnen und Besuchern.",
      ],
    },
    {
      title: "6. E-Mail-Versand",
      lines: [
        "Für den Versand von E-Mails nutze ich Resend (Resend, Inc., USA, resend.com). Über Resend verschicke ich zum Beispiel die Benachrichtigung an mich, wenn Sie das Kontaktformular abgeschickt haben. Dabei werden Ihr Name, Ihre E-Mail-Adresse und Ihre Nachricht an Resend übermittelt. Mit Resend besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO); der Anbieter ist unter dem EU-US Data Privacy Framework zertifiziert, ergänzend gelten Standardvertragsklauseln.",
        "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. f DSGVO (Bearbeitung Ihrer Anfrage).",
      ],
    },
    {
      title: "7. Die 7 Reflexionsfragen",
      lines: [
        "Wenn Sie im Formular ankreuzen, dass Sie die 7 Reflexionsfragen erhalten möchten, schicke ich Ihnen diese persönlich an die angegebene E-Mail-Adresse. Ihre E-Mail-Adresse verwende ich dafür und für die Beantwortung Ihrer Nachricht, nicht für einen Newsletter und nicht für Werbung, solange Sie dem nicht ausdrücklich zugestimmt haben.",
        "Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) durch das Ankreuzen. Sie können sie jederzeit mit Wirkung für die Zukunft widerrufen: eine kurze Nachricht an die oben genannte E-Mail-Adresse genügt.",
      ],
    },
    {
      title: "8. Schutz vor Missbrauch",
      lines: [
        "Damit das Kontaktformular nicht durch automatisierte Massenanfragen missbraucht wird, speichere ich für kurze Zeit eine Kennung Ihrer IP-Adresse (Hashwert), um die Zahl der Anfragen zu begrenzen. Die Kennung wird automatisch nach spätestens einem Tag gelöscht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Sicherheit der Website).",
      ],
    },
    {
      title: "9. Cookies und Schriftarten",
      lines: [
        "Für Besucherinnen und Besucher setzt diese Website keine Cookies und speichert nichts auf Ihrem Gerät. Der geschützte Verwaltungsbereich, der nur für mich zugänglich ist, verwendet ein technisch notwendiges Sitzungs-Cookie, damit ich angemeldet bleibe (§ 25 Abs. 2 Nr. 2 TDDDG). Dafür ist keine Einwilligung nötig.",
        "Die verwendeten Schriftarten sind lokal in die Website eingebunden. Beim Aufruf der Seite wird keine Verbindung zu Google oder anderen Schriftarten-Servern aufgebaut.",
      ],
    },
    {
      title: "10. Externe Links",
      lines: [
        "Diese Website enthält Links zu Facebook, Instagram und zu meinem Lifeplus-Shop. Es handelt sich um einfache Links, keine eingebetteten Inhalte: Daten werden erst übermittelt, wenn Sie einen Link anklicken und die fremde Seite öffnen. Für die Verarbeitung dort ist der jeweilige Anbieter verantwortlich; bitte beachten Sie dessen Datenschutzhinweise.",
      ],
    },
    {
      title: "11. Ihre Rechte",
      lines: ["Sie haben gegenüber mir folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:"],
      list: [
        "Auskunft (Art. 15 DSGVO)",
        "Berichtigung (Art. 16 DSGVO)",
        "Löschung (Art. 17 DSGVO)",
        "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
        "Datenübertragbarkeit (Art. 20 DSGVO)",
        "Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO)",
        "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
      ],
    },
    {
      title: "12. Beschwerderecht",
      lines: [
        `Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren (Art. 77 DSGVO). Für mich zuständig ist: ${authority}.`,
        "Ihre Daten werden nicht für eine automatisierte Entscheidungsfindung oder ein Profiling verwendet.",
      ],
    },
    {
      title: "13. Sicherheit und Stand",
      lines: [
        "Diese Website nutzt aus Sicherheitsgründen eine verschlüsselte Verbindung (HTTPS/TLS). Sie erkennen sie am Schloss-Symbol in der Adresszeile Ihres Browsers.",
        `Stand dieser Datenschutzerklärung: ${LEGAL_STAND}. Ändern sich die Website oder die rechtlichen Vorgaben, passe ich sie an.`,
      ],
    },
  ];
}
