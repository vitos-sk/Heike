"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2 } from "lucide-react";
import { api } from "@/components/admin/api";

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/admin/posts/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  if (confirm) {
    return (
      <span className="adm-confirm" role="alertdialog" aria-label={`„${title}“ löschen?`}>
        Löschen?
        <button type="button" className="adm-linkbtn danger" disabled={busy} onClick={remove}>
          {busy ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <Check className="ic" strokeWidth={1.6} aria-hidden="true" />}
          Ja
        </button>
        <button type="button" className="adm-linkbtn" onClick={() => setConfirm(false)}>
          Nein
        </button>
        {error && <span className="adm-error" role="alert">{error}</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="adm-iconbtn danger"
      aria-label={`„${title}“ löschen`}
      title="Löschen"
      onClick={() => setConfirm(true)}
    >
      <Trash2 className="ic" strokeWidth={1.6} aria-hidden="true" />
    </button>
  );
}
