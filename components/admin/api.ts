// Gemeinsamer fetch-Helfer für den Admin: JSON in, JSON out, 401 → zurück zum Login.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json", ...init.headers }
        : init?.headers,
    });
  } catch {
    throw new ApiError("Keine Verbindung. Bitte prüfe dein Internet und versuche es erneut.", 0);
  }

  if (res.status === 401 && !url.endsWith("/login")) {
    window.location.href = "/admin/login";
    throw new ApiError("Bitte melde dich neu an.", 401);
  }

  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new ApiError(data.error ?? "Etwas ist schiefgelaufen. Bitte versuche es erneut.", res.status);
  }
  return data as T;
}
