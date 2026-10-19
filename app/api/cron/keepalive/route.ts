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

  const db = getDb();
  const { error } = await db.from("settings").select("key", { head: true, count: "exact" }).limit(1);
  if (error) {
    console.error("Keepalive fehlgeschlagen", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  // Abgelaufene Rate-Limit-Zähler (enthalten Hashwerte von IP-Adressen) täglich entfernen.
  const { error: cleanError } = await db.from("rate_limits").delete().lt("expires_at", new Date().toISOString());
  if (cleanError) console.error("Keepalive: Aufräumen fehlgeschlagen", cleanError.message);

  // Nur echte Cron-Läufe von Vercel protokollieren – so lässt sich später prüfen,
  // ob der tägliche Lauf wirklich stattfindet.
  if (request.headers.get("user-agent")?.startsWith("vercel-cron")) {
    const { error: logError } = await db
      .from("settings")
      .upsert({ key: "keepalive_last_run", value: { at: new Date().toISOString() }, updated_at: new Date().toISOString() });
    if (logError) console.error("Keepalive: Protokoll fehlgeschlagen", logError.message);
  }
  return NextResponse.json({ ok: true });
}
