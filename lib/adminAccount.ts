import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { getDb } from "@/lib/supabase";

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

const SETTINGS_KEY = "admin_account";
const KEY_LENGTH = 64;

export type AdminAccount = {
  email: string;
  passwordHash: string;
  updatedAt: number;
};

export const PASSWORD_MIN_LENGTH = 8;

export function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const derived = await scrypt(password, salt, expected.length || KEY_LENGTH);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

async function writeAccount(account: AdminAccount): Promise<void> {
  const { error } = await getDb()
    .from("settings")
    .upsert({ key: SETTINGS_KEY, value: account, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Erstanlage aus den Umgebungsvariablen: Solange noch kein Konto in der Datenbank
// liegt, gelten ADMIN_EMAIL/ADMIN_PASSWORD. Beim ersten Zugriff wird daraus ein
// Eintrag geschrieben — ab dann zählt nur noch die Datenbank, und das Passwort
// lässt sich im Admin ändern.
async function seedFromEnv(): Promise<AdminAccount | null> {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error("Admin-Konto: ADMIN_EMAIL und/oder ADMIN_PASSWORD fehlen — Erstanlage nicht möglich.");
    return null;
  }

  const account: AdminAccount = {
    email,
    passwordHash: await hashPassword(password),
    updatedAt: Date.now(),
  };
  await writeAccount(account);
  return account;
}

export async function getAdminAccount(): Promise<AdminAccount | null> {
  const { data, error } = await getDb()
    .from("settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (error) throw error;

  const value = (data?.value ?? {}) as Record<string, unknown>;
  const email = normalizeEmail(value.email);
  const passwordHash = typeof value.passwordHash === "string" ? value.passwordHash : "";
  if (!email || !passwordHash) return seedFromEnv();

  return {
    email,
    passwordHash,
    updatedAt: typeof value.updatedAt === "number" ? value.updatedAt : 0,
  };
}

export async function updateAdminAccount(input: {
  email?: string;
  password?: string;
}): Promise<AdminAccount> {
  const current = await getAdminAccount();
  if (!current) throw new Error("Kein Admin-Konto vorhanden");

  const next: AdminAccount = {
    email: input.email ? normalizeEmail(input.email) : current.email,
    passwordHash: input.password ? await hashPassword(input.password) : current.passwordHash,
    updatedAt: Date.now(),
  };
  await writeAccount(next);
  return next;
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const account = await getAdminAccount();
  if (!account) return false;

  const emailOk = normalizeEmail(email) === account.email;
  // Passwort immer prüfen: eine falsche E-Mail soll nicht schneller beantwortet werden.
  const passwordOk = await verifyPassword(password, account.passwordHash);
  return emailOk && passwordOk;
}
