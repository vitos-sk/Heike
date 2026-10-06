import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { impressum } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return <LegalPage heading={impressum.heading} sections={impressum.sections} />;
}
