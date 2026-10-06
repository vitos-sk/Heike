import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { datenschutz } from "@/lib/placeholder-data";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
  return <LegalPage heading={datenschutz.heading} sections={datenschutz.sections} />;
}
