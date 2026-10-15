import { NextResponse, type NextRequest } from "next/server";
import { getDb, isDbConfigured } from "@/lib/supabase";

// Wird täglich von Vercel Cron aufgerufen (siehe vercel.json). Der kleine Datenbankzugriff
// verhindert, dass Supabase das kostenlose Projekt wegen Inaktivität pausiert.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, error: "db not configured" }, { status: 503 });
  }

  const { error } = await getDb().from("settings").select("key", { head: true, count: "exact" }).limit(1);
  if (error) {
    console.error("Keepalive fehlgeschlagen", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
