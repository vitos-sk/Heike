import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import {
  GATE_COOKIE_NAME,
  GATE_MAX_AGE,
  GATE_QUERY_PARAM,
  createGateToken,
  safeCompareKey,
  verifyGateToken,
} from "@/lib/gate";

// Diese Pfade brauchen keine Session (aber weiterhin einen gültigen Gate-Key),
// sonst käme man an ein vergessenes Passwort nie heran.
const PUBLIC_ADMIN_PATHS = new Set([
  "/admin/login",
  "/admin/reset-password",
  "/api/admin/login",
  "/api/admin/forgot-password",
  "/api/admin/reset-password",
]);

function setGateCookie(response: NextResponse, token: string) {
  response.cookies.set(GATE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax: der Link wird oft aus Messenger/Mail geöffnet; Strict-Cookies gehen dort verloren.
    sameSite: "lax",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Ohne gültigen Gate-Key/-Cookie ist der gesamte Admin-Bereich unsichtbar (404):
  // /admin lässt sich weder erraten noch scannen.
  const gateCookieToken = request.cookies.get(GATE_COOKIE_NAME)?.value;
  let gateOk = gateCookieToken ? await verifyGateToken(gateCookieToken) : false;

  const providedKey = searchParams.get(GATE_QUERY_PARAM);
  let justGated = false;
  if (!gateOk && providedKey) {
    const expectedKey = process.env.ADMIN_GATE_KEY;
    gateOk = expectedKey ? await safeCompareKey(providedKey, expectedKey) : false;
    justGated = gateOk;
  }

  if (!gateOk) {
    return new NextResponse(null, { status: 404 });
  }

  let gateToken: string | null = null;
  if (justGated) {
    try {
      gateToken = await createGateToken();
    } catch {
      // ADMIN_GATE_SECRET fehlt: geschlossen bleiben.
      return new NextResponse(null, { status: 404 });
    }
  }

  const finish = (response: NextResponse) => {
    if (gateToken) setGateCookie(response, gateToken);
    return response;
  };

  // Den Key aus der Adresszeile entfernen (andere Parameter, z. B. das Reset-Token, bleiben).
  if (justGated && !pathname.startsWith("/api/")) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete(GATE_QUERY_PARAM);
    const hasSession = await sessionOk(request);
    if (!PUBLIC_ADMIN_PATHS.has(pathname) && !hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
      return finish(NextResponse.redirect(loginUrl));
    }
    return finish(NextResponse.redirect(cleanUrl));
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return finish(NextResponse.next());
  }

  if (!(await sessionOk(request))) {
    if (pathname.startsWith("/api/")) {
      return finish(NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 }));
    }
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
    return finish(NextResponse.redirect(loginUrl));
  }

  return finish(NextResponse.next());
}

async function sessionOk(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : false;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
