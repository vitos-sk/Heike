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
      <ReflectionCta />
      <Contact />
    </main>
  );
}
