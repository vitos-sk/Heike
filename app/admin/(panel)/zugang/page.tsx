import AccountForm from "@/components/admin/AccountForm";
import { getAdminAccount } from "@/lib/adminAccount";
import { GATE_QUERY_PARAM } from "@/lib/gate";
import { headers } from "next/headers";

export const metadata = { title: "Zugang" };

export default async function AccessPage() {
  const account = await getAdminAccount().catch(() => null);

  // Der private Admin-Link zum Speichern als Lesezeichen (nur für angemeldete Admins sichtbar).
  const host = headers().get("host");
  const proto = host?.startsWith("localhost") ? "http" : "https";
  const gateKey = process.env.ADMIN_GATE_KEY;
  const adminLink = host && gateKey ? `${proto}://${host}/admin?${GATE_QUERY_PARAM}=${encodeURIComponent(gateKey)}` : null;

  return <AccountForm initialEmail={account?.email ?? ""} adminLink={adminLink} />;
}
