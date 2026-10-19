import Hero from "@/components/Hero";
import Herzensanliegen from "@/components/Herzensanliegen";
import Services from "@/components/Services";
import Kindergesundheit from "@/components/Kindergesundheit";
import Konzept from "@/components/Konzept";
import About from "@/components/About";
import Values from "@/components/Values";
import Qualifications from "@/components/Qualifications";
import ReflectionCta from "@/components/ReflectionCta";
import Contact from "@/components/Contact";
import News from "@/components/News";
import { getQuestionnaire } from "@/lib/questionnaire";
import { reflection } from "@/lib/placeholder-data";

// Neuigkeiten und Reflexionsfragen kommen aus der Datenbank: alle 5 Minuten neu, sofort beim Speichern im Admin.
export const revalidate = 300;

// Die Fragen stammen aus dem Admin („Fragen-Mail“); ohne Datenbank gilt die Standardliste.
async function loadQuestions(): Promise<string[]> {
  try {
    const { questions } = await getQuestionnaire();
    return questions.length > 0 ? questions : reflection.questions;
  } catch (error) {
    console.error("Reflexionsfragen konnten nicht geladen werden", error);
    return reflection.questions;
  }
}

export default async function Home() {
  const questions = await loadQuestions();

  return (
    <main id="main">
      <Hero />
      <Herzensanliegen />
      <Services />
      <Kindergesundheit />
      <Konzept />
      <About />
      <Values />
      <Qualifications />
      <News />
      <ReflectionCta questions={questions} />
      <Contact questionCount={questions.length} />
    </main>
  );
}
