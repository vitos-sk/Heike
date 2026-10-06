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

// Neuigkeiten kommen aus der Datenbank: alle 5 Minuten neu, sofort beim Speichern im Admin.
export const revalidate = 300;

export default function Home() {
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
      <ReflectionCta />
      <Contact />
    </main>
  );
}
