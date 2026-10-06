// Zentrale Datei für alle Platzhalter-Inhalte der Website.
// Später kann dieser Inhalt durch echte Daten aus einer Datenbank ersetzt werden.

export const siteMeta = {
  title: "Heike Schaub · Gesundheit mit Herz",
  description:
    "Heike Schaub begleitet Menschen und Familien dabei, ihre Gesundheit bewusster zu leben – ehrlich, herzlich und ohne Druck.",
};

export const header = {
  logoText: "Heike Schaub",
  menuLabel: "Menü",
  ctaText: "Kostenloses Kennenlerngespräch",
  nav: [
    { label: "Angebot", href: "#services", icon: "sparkle" },
    { label: "Kindergesundheit", href: "#kindergesundheit", icon: "leaf" },
    { label: "Mein Konzept", href: "#konzept", icon: "book" },
    { label: "Über mich", href: "#about", icon: "heart" },
    { label: "Kontakt", href: "#contact", icon: "mail" },
  ] as const,
};

export const hero = {
  eyebrow: "Von Mensch zu Mensch · Mit Herz und Erfahrung",
  heading: "Gesundheit darf sich gut anfühlen.",
  subheading:
    "Hallo, ich bin Heike. Ich begleite Menschen und Familien dabei, ihre Gesundheit bewusster zu leben – ehrlich, herzlich und ohne Druck. Denn oft sind es die kleinen Schritte, die langfristig etwas verändern.",
  ctaText: "Kostenloses Kennenlerngespräch",
  portraitName: "Heike Schaub",
  portraitTagline: "Gesundheit mit Herz",
};

export const herzensanliegen = {
  eyebrow: "Mein Herzensanliegen",
  heading:
    "Ich möchte Menschen Mut machen, ihre Gesundheit selbst in die Hand zu nehmen.",
  text: "Für mich bedeutet Gesundheit nicht, jeden Tag alles perfekt zu machen. Gesundheit beginnt dort, wo wir wieder bewusster auf uns und unseren Körper hören. Mit meiner Erfahrung aus der Kinderkrankenpflege, der Ernährungsberatung und dem Gesundheitscoaching möchte ich Wissen verständlich machen und Menschen auf Augenhöhe begleiten.",
};

export const about = {
  heading: "Hallo, ich bin Heike.",
  text: "Ich bin Heike, verheiratet und Mutter einer Tochter. Zu unserer Familie gehört auch unser Hund, der mich zuverlässig nach draußen bringt. Familie bedeutet für mich Zusammenhalt, Geborgenheit und füreinander da zu sein – besonders dann, wenn das Leben uns vor Herausforderungen stellt.\n\nIch bin ein aktiver Mensch und verbringe meine freie Zeit am liebsten in Bewegung und in der Natur. Ob beim Joggen, bei Spaziergängen mit unserem Hund, beim Wandern oder auf dem Fahrrad – draußen kann ich neue Energie tanken und den Kopf frei bekommen. Ebenso wichtig sind mir gemeinsame Erlebnisse, gute Gespräche und wertvolle Zeit mit Freunden und Familie.\n\nIm Jahr 2021 veränderte ein schwerer Mountainbike-Unfall meines Mannes unseren Familienalltag von einem Moment auf den anderen. Mehrere Operationen und ein langer Weg der Genesung stellten uns vor große Herausforderungen und verlangten uns als Familie viel Kraft, Geduld und Zuversicht ab.\n\nWir sind bis heute sehr dankbar für die Möglichkeiten der modernen Medizin und die professionelle Begleitung während dieser Zeit. Gleichzeitig haben wir erfahren, wie wertvoll das sein kann, was wir selbst ergänzend beitragen können: Verantwortung zu übernehmen, sich gut zu informieren und den Körper durch bewusste Ernährung, eine gute Versorgung mit Vitalstoffen und einen gesundheitsbewussten Lebensstil zu unterstützen.\n\nDiese Erfahrung hat meinen Blick auf Gesundheit nachhaltig geprägt. Eigenverantwortung bedeutet für mich nicht, alles allein schaffen zu müssen oder medizinische Unterstützung zu ersetzen. Sie bedeutet, die eigenen Möglichkeiten zu erkennen, bewusste Entscheidungen zu treffen und aktiv zum persönlichen Wohlbefinden beizutragen.\n\nIch habe gelernt, wie wichtig Disziplin, Geduld und Vertrauen in die eigene Kraft sind. Dieses Wissen und meine Erfahrungen möchte ich heute weitergeben. Ich möchte Menschen dort abholen, wo sie gerade stehen, ihnen verständliche Impulse geben und sie darin bestärken, ihren eigenen Weg zu mehr Gesundheit und Lebensqualität zu finden.",
  photo: "/heike-beach.png",
  quote:
    "Wir können nicht jede Herausforderung beeinflussen. Aber wir können mitgestalten, wie wir ihr begegnen – mit Eigenverantwortung, Vertrauen und dem Mut, Schritt für Schritt weiterzugehen.",
};

export const values = {
  heading: "Meine Werte",
  items: [
    "Vertrauen",
    "Herzlichkeit",
    "Fachwissen",
    "Ganzheitlichkeit",
    "Familiengesundheit",
    "Begleitung auf Augenhöhe",
  ],
};

export const services = {
  heading: "Mein Angebot",
  subheading:
    "Gesundheit von Anfang an stärken – mit Erfahrung, Fachwissen und einem liebevollen Blick auf die ganze Familie.",
  items: [
    {
      title: "Gesundheitscoaching",
      description:
        "Persönliche Begleitung für mehr Energie, Wohlbefinden und Balance im Alltag.",
    },
    {
      title: "Ernährungsberatung",
      description:
        "Alltagstaugliche Impulse, die zu deinem Leben passen – ohne Druck und ohne starre Verbote.",
    },
    {
      title: "Kindergesundheit",
      description:
        "Gesundheit von Anfang an stärken – mit Erfahrung, Fachwissen und einem liebevollen Blick auf die ganze Familie.",
    },
    {
      title: "Ganzheitliche Prävention",
      description:
        "Ein verständlicher Blick auf Lebensstil, Mikronährstoffe, Routinen und Gesundheitsbewusstsein.",
    },
    {
      title: "Lifeplus Konzept",
      description:
        "Bewusste Ernährung, Mikronährstoffe, Bewegung und Regeneration als Bausteine eines gesunden Lebensstils.",
    },
    {
      title: "Selbstständige Perspektiven",
      description:
        "Für Menschen, die Gesundheit lieben und sich ein zweites Standbein im Empfehlungsmarketing aufbauen möchten.",
    },
  ],
};

export const kindergesundheit = {
  heading: "Kleine Menschen. Große Verantwortung. Ganz viel Herz.",
  paragraphs: [
    "Kinder und ihre Familien zu begleiten, ist für mich etwas ganz Besonderes. Als Kinderkrankenschwester habe ich erlebt, wie wichtig Vertrauen, ein offenes Ohr und verständliche Informationen für Eltern sind.",
    "Heute verbinde ich diese Erfahrung mit meinem Wissen rund um Ernährung, Mikronährstoffe und gesunde Alltagsroutinen. Mein Wunsch ist es, Familien zu stärken und Eltern Impulse zu geben, die wirklich in ihr Leben passen.",
    "Denn Kindergesundheit braucht keine Perfektion. Sie braucht Aufmerksamkeit, liebevolle Gewohnheiten und viele kleine Schritte, die gemeinsam wachsen dürfen.",
  ],
  quoteCard: {
    heading: "Mit Herz & Erfahrung",
    text: "Als Kinderkrankenschwester und Ernährungsberaterin begleite ich Familien mit Fachwissen und einem ganzheitlichen Blick.",
  },
};

export const konzept = {
  quote: "Der Mensch steht im Mittelpunkt – das Konzept begleitet den Weg.",
  heading: "Mein ganzheitliches Lifeplus Konzept",
  subheading: "Dein Weg darf so individuell sein wie du.",
  paragraphs: [
    "Ich glaube nicht an die eine Lösung für alle. Jeder Mensch bringt seine eigene Geschichte, seinen Alltag und seine persönlichen Ziele mit.",
    "Das Lifeplus Konzept ist für mich ein Baustein meiner ganzheitlichen Begleitung. Bewusste Ernährung, hochwertige Mikronährstoffe, Bewegung, Regeneration und persönliche Entwicklung greifen dabei ineinander.",
    "Mir ist wichtig, dir nichts überzustülpen. Wir schauen gemeinsam und ganz in Ruhe, was zu dir passt. Ich erkläre, höre zu und begleite dich – damit du deine eigenen, bewussten Entscheidungen treffen kannst.",
  ],
};

export const qualifications = {
  heading: "Meine Qualifikationen & Erfahrungen",
  intro:
    "Ich verbinde langjährige pflegefachliche Erfahrung mit Wissen aus der Ernährungsberatung und persönlichen Erfahrungen aus dem familiären Umfeld. So begleite ich Menschen verständnisvoll, praxisnah und auf Augenhöhe.",
  training: {
    heading: "Aus- und Weiterbildungen",
    items: [
      "Examinierte Kinderkrankenschwester",
      "Langjährige Erfahrung in der Pflegebegutachtung",
      "Weiterbildung im Bereich Ernährungsberatung",
    ],
  },
  sections: [
    {
      title: "Berufliche Erfahrung",
      text: "Durch meine langjährige Tätigkeit als Kinderkrankenschwester im stationären Bereich habe ich Kinder und ihre Familien in ganz unterschiedlichen Lebens- und Gesundheitssituationen begleitet. Diese Zeit hat mich gelehrt, genau hinzuhören, individuelle Bedürfnisse wahrzunehmen und auch in herausfordernden Momenten den Menschen als Ganzes zu sehen.",
    },
    {
      title: "Persönliche Erfahrung",
      text: "Eigene Erfahrungen in meinem familiären Umfeld haben meinen Blick auf Gesundheit, Ernährung und Lebensqualität zusätzlich geprägt. Sie haben mir gezeigt, wie wichtig verständliche Informationen, ein offenes Ohr und alltagstaugliche Unterstützung für Betroffene und ihre Angehörigen sind.",
    },
    {
      title: "Mein Ansatz",
      text: "Ich möchte meine Erfahrungen und mein Wissen weitergeben und Menschen dort abholen, wo sie gerade stehen. Dabei geht es mir nicht um Perfektion oder starre Vorgaben, sondern um individuelle und realistische Schritte, die zum jeweiligen Menschen und seinem Alltag passen. Mit Fachwissen, Empathie und einem ganzheitlichen Blick möchte ich Mut machen, die eigene Gesundheit bewusster zu gestalten und persönliche Entscheidungen gut informiert zu treffen.",
    },
  ],
};

export const reflection = {
  eyebrow: "Dein persönlicher Gesundheits-Check-in",
  heading: "7 Reflexionsfragen für mehr Gesundheit und Lebensqualität",
  intro: [
    "Gesundheit beginnt oft mit einem ehrlichen Blick auf das eigene Leben. Diese sieben Fragen laden dich dazu ein, kurz innezuhalten, deine Bedürfnisse bewusster wahrzunehmen und herauszufinden, was dir und deiner Familie wirklich guttut.",
    "Keine To-do-Liste. Kein Anspruch auf Perfektion. Nur sieben persönliche Fragen, die dir neue Impulse für mehr Energie, Wohlbefinden und gesunde Gewohnheiten schenken können.",
  ],
  questions: [
    "Woran merkst du, dass es dir körperlich und innerlich wirklich gut geht?",
    "Was schenkt dir im Alltag Energie – und was kostet dich besonders viel Kraft?",
    "Wie aufmerksam nimmst du die Signale deines Körpers wahr?",
    "Welche kleine Gewohnheit könnte dein Wohlbefinden spürbar stärken?",
    "Was braucht deine Familie, damit Gesundheit im Alltag leichter gelebt werden kann?",
    "Welche gesunden Gewohnheiten möchtest du deinen Kindern mit auf den Weg geben?",
    "Was bedeutet Lebensqualität ganz persönlich für dich – und welchen ersten Schritt möchtest du dafür gehen?",
  ],
  buttonText: "Hol dir deine 7 Reflexionsfragen",
  tip: {
    heading: "Mein Tipp",
    text: "Nimm dir für jede Frage einen ruhigen Moment. Du musst nicht sofort auf alles eine Antwort haben. Manchmal entsteht Klarheit erst dann, wenn wir uns erlauben, aufmerksam hinzuhören.\n\nDenn Gesundheit braucht keine Perfektion. Sie darf in vielen kleinen Schritten wachsen – in deinem eigenen Tempo und passend zu deinem Leben.",
  },
};

export const contact = {
  eyebrow: "Vielleicht ist jetzt dein Moment",
  heading: "Lass uns ganz unverbindlich kennenlernen.",
  subheading:
    "Du hast Fragen zu deiner Gesundheit, wünschst dir neue Impulse für deine Familie oder bist neugierig auf mein Lifeplus Konzept? Dann schreib mir. Bei einer Tasse Kaffee oder in einem persönlichen Gespräch schauen wir ganz entspannt, was dich gerade bewegt.",
  email: "Schaub-heike@gmx.de",
  phone: "0173 7214830",
  social: [
    { label: "Facebook", href: "https://www.facebook.com/share/1bCRui9Ppv/" },
    { label: "Instagram", href: "https://www.instagram.com/heikerle_77" },
  ],
  form: {
    nameLabel: "Name",
    emailLabel: "E-Mail",
    messageLabel: "Nachricht",
    submitLabel: "Nachricht schreiben",
  },
};

export const footer = {
  copyright: "© Heike Schaub · Gesundheit mit Herz · Für Menschen und Familien",
  disclaimer:
    "Hinweis: Meine Inhalte und Beratungen ersetzen keine ärztliche Diagnose oder Behandlung. Bei gesundheitlichen Beschwerden wende dich bitte an eine Ärztin oder einen Arzt.",
  links: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
  ],
};

export const impressum = {
  heading: "Impressum",
  sections: [
    {
      title: "Angaben gemäß § 5 TMG",
      lines: ["[Name/Firma]", "[Adresse]", "[PLZ, Ort]", "[Land]"],
    },
    {
      title: "Kontakt",
      lines: ["Telefon: 0173 7214830", "E-Mail: Schaub-heike@gmx.de"],
    },
    {
      title: "Umsatzsteuer-ID",
      lines: [
        "Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz: [USt-IdNr.]",
      ],
    },
    {
      title: "Berufsbezeichnung und berufsrechtliche Regelungen",
      lines: ["[Berufsbezeichnung]", "[Zuständige Kammer]", "[Verliehen in: Land]"],
    },
    {
      title: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV",
      lines: ["[Name/Firma]", "[Adresse]"],
    },
    {
      title: "Streitschlichtung",
      lines: [
        "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [Link zur OS-Plattform].",
        "Unsere E-Mail-Adresse finden Sie oben im Impressum.",
        "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      ],
    },
  ],
};

export const datenschutz = {
  heading: "Datenschutzerklärung",
  sections: [
    {
      title: "1. Datenschutz auf einen Blick",
      lines: [
        "[Allgemeine Hinweise zum Datenschutz]",
        "Verantwortliche Stelle: [Name/Firma], [Adresse], E-Mail: [E-Mail], Telefon: [Telefon]",
      ],
    },
    {
      title: "2. Allgemeine Hinweise und Pflichtinformationen",
      lines: [
        "[Hinweise zum Datenschutz gemäß DSGVO]",
        "Verantwortlicher: [Name/Firma], [Adresse]",
      ],
    },
    {
      title: "3. Datenerfassung auf dieser Website",
      lines: [
        "[Beschreibung, welche Daten beim Besuch der Website erfasst werden, z. B. Server-Log-Dateien]",
      ],
    },
    {
      title: "4. Kontaktformular",
      lines: [
        "[Hinweis, dass bei Nutzung des Kontaktformulars Name, E-Mail-Adresse und Nachricht gespeichert werden]",
        "Rechtsgrundlage: [Art. 6 Abs. 1 lit. b/f DSGVO]",
        "Speicherdauer: [Angabe zur Speicherdauer]",
      ],
    },
    {
      title: "5. Ihre Rechte",
      lines: [
        "Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch.",
        "Bei Fragen wenden Sie sich an: [E-Mail]",
      ],
    },
    {
      title: "6. Hosting",
      lines: ["[Angaben zum Hosting-Anbieter, sofern zutreffend]"],
    },
  ],
};
