import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Nur auf dem Server benutzen: der Service-Key umgeht RLS und darf nie in den Browser.
let client: SupabaseClient | null = null;

export function getDb(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
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
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export const IMAGE_BUCKET = "blog-images";
