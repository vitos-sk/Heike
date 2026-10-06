"use client";

import { AlertTriangle } from "lucide-react";

export default function PanelError({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  return (
    <div className="adm-empty adm-empty--error" role="alert">
      <AlertTriangle className="ic" strokeWidth={1.6} aria-hidden="true" />
      <h1 className="adm-h2">Das hat leider nicht geklappt.</h1>
      <p>
        Die Daten konnten gerade nicht geladen werden. Bitte versuche es gleich noch einmal. Wenn es
        bleibt, prüfe die Verbindung zur Datenbank (SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY).
      </p>
      <button type="button" className="btn" onClick={reset}>
        Erneut versuchen
      </button>
    </div>
  );
}
