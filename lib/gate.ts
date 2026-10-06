import { SignJWT, jwtVerify } from "jose";

export const GATE_COOKIE_NAME = "admin_gate";
export const GATE_QUERY_PARAM = "key";
const GATE_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 Tage: der Link soll nicht ständig neu nötig sein

function getGateSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_GATE_SECRET;
  if (!secret) {
    throw new Error("ADMIN_GATE_SECRET ist nicht gesetzt");
  }
  return new TextEncoder().encode(secret);
}

export async function createGateToken(): Promise<string> {
  return new SignJWT({ gate: "ok" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${GATE_DURATION_SECONDS}s`)
    .sign(getGateSecretKey());
}

export async function verifyGateToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getGateSecretKey());
    return payload.gate === "ok";
  } catch {
    return false;
  }
}

export const GATE_MAX_AGE = GATE_DURATION_SECONDS;

// Konstante Laufzeit unabhängig von Länge/Inhalt des Keys (kein Timing-Leak).
export async function safeCompareKey(provided: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(provided)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  const aBytes = new Uint8Array(a);
  const bBytes = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}
