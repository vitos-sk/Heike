const TZ = "Europe/Berlin";

const LONG_DATE = new Intl.DateTimeFormat("de-DE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TZ,
});

const SHORT_DATE = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: TZ,
});

const DATE_TIME = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});

/** ISO-Datum ("2026-09-12") als "12. September 2026". */
export function formatEventDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return LONG_DATE.format(date);
}

export function formatTimestamp(timestamp: number): string {
  return LONG_DATE.format(new Date(timestamp));
}

export function formatTimestampShort(timestamp: number): string {
  return SHORT_DATE.format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  return DATE_TIME.format(new Date(timestamp));
}

/** "vor 5 Min." / "gestern" / Datum – für die Nachrichtenliste. */
export function formatRelative(timestamp: number, now = Date.now()): string {
  const diff = now - timestamp;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "gerade eben";
  if (diff < hour) return `vor ${Math.floor(diff / minute)} Min.`;
  if (diff < day) return `vor ${Math.floor(diff / hour)} Std.`;
  if (diff < 2 * day) return "gestern";
  if (diff < 7 * day) return `vor ${Math.floor(diff / day)} Tagen`;
  return SHORT_DATE.format(new Date(timestamp));
}

/** Wert für <input type="datetime-local"> in lokaler Zeit. */
export function toDateTimeLocalValue(timestamp: number): string {
  const date = new Date(timestamp);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
