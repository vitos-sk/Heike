import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { impressumSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Impressum",
};

export default function ImpressumPage() {
  return <LegalPage heading="Impressum" sections={impressumSections()} />;
}
