import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { datenschutzSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
  return <LegalPage heading="Datenschutzerklärung" sections={datenschutzSections()} />;
}
