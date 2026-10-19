// Texte rund um die Reflexionsfragen. Die Fragen selbst stammen aus dem Admin („Fragen-Mail“);
// alles, was die Anzahl nennt, richtet sich nach der tatsächlichen Zahl.

const WORDS = ["", "eine", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];

const word = (n: number) => WORDS[n] ?? String(n);

export function reflectionTexts(count: number) {
  const one = count === 1;
  return {
    heading: one
      ? "Eine Reflexionsfrage für mehr Gesundheit und Lebensqualität"
      : `${count} Reflexionsfragen für mehr Gesundheit und Lebensqualität`,
    intro: [
      one
        ? "Gesundheit beginnt oft mit einem ehrlichen Blick auf das eigene Leben. Diese Frage lädt dich dazu ein, kurz innezuhalten, deine Bedürfnisse bewusster wahrzunehmen und herauszufinden, was dir und deiner Familie wirklich guttut."
        : `Gesundheit beginnt oft mit einem ehrlichen Blick auf das eigene Leben. Diese ${word(count)} Fragen laden dich dazu ein, kurz innezuhalten, deine Bedürfnisse bewusster wahrzunehmen und herauszufinden, was dir und deiner Familie wirklich guttut.`,
      one
        ? "Keine To-do-Liste. Kein Anspruch auf Perfektion. Nur eine persönliche Frage, die dir neue Impulse für mehr Energie, Wohlbefinden und gesunde Gewohnheiten schenken kann."
        : `Keine To-do-Liste. Kein Anspruch auf Perfektion. Nur ${word(count)} persönliche Fragen, die dir neue Impulse für mehr Energie, Wohlbefinden und gesunde Gewohnheiten schenken können.`,
    ],
    buttonText: one ? "Hol dir deine Reflexionsfrage" : `Hol dir deine ${count} Reflexionsfragen`,
    // „… möchte außerdem <label> erhalten“
    optionLabel: one ? "die Reflexionsfrage" : `die ${count} Reflexionsfragen`,
  };
}
