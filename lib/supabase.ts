import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Nur auf dem Server benutzen: der Service-Key umgeht RLS und darf nie in den Browser.
let client: SupabaseClient | null = null;

// Die Vercel-Integration setzt NEXT_PUBLIC_SUPABASE_URL, lokal/manuell wird SUPABASE_URL benutzt.
function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getDb(): SupabaseClient {
  if (client) return client;

  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL und/oder SUPABASE_SERVICE_ROLE_KEY fehlen");
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Next.js cached GET-Anfragen standardmäßig — für Admin-Daten fatal.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return client;
}

export function isDbConfigured(): boolean {
  return Boolean(supabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const IMAGE_BUCKET = "blog-images";
