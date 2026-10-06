import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { getAdminAccount, type AdminAccount } from "@/lib/adminAccount";

const RESET_DURATION_SECONDS = 30 * 60; // 30 Minuten
const AUDIENCE = "admin-password-reset";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET ist nicht gesetzt");
  }
  return new TextEncoder().encode(secret);
}

// Fingerabdruck des aktuellen Passworts: Sobald es geändert wurde, passt er nicht
// mehr — der Link ist damit automatisch einmalig.
function fingerprint(account: AdminAccount): string {
  return createHash("sha256").update(account.passwordHash).digest("hex").slice(0, 32);
}

export async function createResetToken(account: AdminAccount): Promise<string> {
  return new SignJWT({ email: account.email, fp: fingerprint(account) })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${RESET_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyResetToken(token: string): Promise<AdminAccount | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { audience: AUDIENCE });
    const account = await getAdminAccount();
    if (!account) return null;
    if (payload.email !== account.email) return null;
    if (payload.fp !== fingerprint(account)) return null;
    return account;
  } catch {
    return null;
  }
}

export const RESET_LINK_VALID_MINUTES = RESET_DURATION_SECONDS / 60;
