"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Check,
  CheckCheck,
  Loader2,
  Mail,
  MailQuestion,
  Reply,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { api } from "@/components/admin/api";
import { formatDateTime } from "@/lib/postDate";
import type { Submission, SubmissionStatus } from "@/types/submission";

type Busy = "status" | "delete" | "questions" | "note" | null;

export default function SubmissionDetail({
  submission,
  questionCount,
}: {
  submission: Submission;
  questionCount: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [note, setNote] = useState(submission.note);
  const [noteSaved, setNoteSaved] = useState(false);
  const markedRef = useRef(false);

  // Beim Öffnen automatisch als gelesen markieren.
  useEffect(() => {
    if (submission.status !== "new" || markedRef.current) return;
    markedRef.current = true;
    api(`/api/admin/submissions/${submission.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "read" }),
    })
      .then(() => router.refresh())
      .catch(() => {});
  }, [submission.id, submission.status, router]);

  async function setStatus(status: SubmissionStatus) {
    setBusy("status");
    setError(null);
    try {
      await api(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    setError(null);
    try {
      await api(`/api/admin/submissions/${submission.id}`, { method: "DELETE" });
      router.push("/admin/briefe");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  async function sendQuestions() {
    setBusy("questions");
    setError(null);
    try {
      await api(`/api/admin/submissions/${submission.id}/send-questions`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function saveNote() {
    if (note === submission.note) return;
    setBusy("note");
    setError(null);
    try {
      await api(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        body: JSON.stringify({ note }),
      });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const archived = submission.status === "archived";
  const answered = submission.status === "answered";
  const replySubject = encodeURIComponent(`Re: Deine Nachricht an Heike Schaub`);
  const replyBody = encodeURIComponent(`Hallo ${submission.name.split(" ")[0]},\n\n\n\n`);

  return (
    <article className="adm-detail">
      <header className="adm-detail-head">
        <span className="adm-avatar adm-avatar--lg" aria-hidden="true">
          {submission.name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <div>
          <h2 className="adm-h2">{submission.name}</h2>
          <a className="adm-mail-link" href={`mailto:${submission.email}`}>
            {submission.email}
          </a>
          <p className="adm-muted">{formatDateTime(submission.createdAt)}</p>
        </div>
      </header>

      <div className="adm-message">{submission.message}</div>

      <div className="adm-actions">
        <a
          className="btn"
          href={`mailto:${submission.email}?subject=${replySubject}&body=${replyBody}`}
        >
          <Reply className="ic" strokeWidth={1.6} aria-hidden="true" />
          Antworten
        </a>

        {answered ? (
          <button type="button" className="btn btn--ghost" disabled={busy !== null} onClick={() => setStatus("read")}>
            <RotateCcw className="ic" strokeWidth={1.6} aria-hidden="true" />
            Wieder öffnen
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy !== null || archived}
            onClick={() => setStatus("answered")}
          >
            {busy === "status" ? <Loader2 className="ic adm-spin" /> : <CheckCheck className="ic" strokeWidth={1.6} aria-hidden="true" />}
            Als beantwortet markieren
          </button>
        )}
      </div>

      {(submission.wantsQuestions || submission.questionsSentAt) && (
        <section className="adm-box" aria-label="Reflexionsfragen">
          <div className="adm-box-ic">
            <MailQuestion className="ic" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <div className="adm-box-txt">
            <h3>Die 7 Reflexionsfragen</h3>
            <p>
              {submission.questionsSentAt
                ? `Gesendet am ${formatDateTime(submission.questionsSentAt)}.`
                : `${submission.name.split(" ")[0]} hat die Fragen angefragt. Sie sind noch nicht verschickt.`}
            </p>
          </div>
          <button
            type="button"
            className={submission.questionsSentAt ? "btn btn--ghost" : "btn"}
            disabled={busy !== null}
            onClick={sendQuestions}
          >
            {busy === "questions" ? (
              <Loader2 className="ic adm-spin" aria-hidden="true" />
            ) : (
              <Mail className="ic" strokeWidth={1.6} aria-hidden="true" />
            )}
            {submission.questionsSentAt ? "Erneut senden" : `${questionCount} Fragen senden`}
          </button>
        </section>
      )}

      {!submission.wantsQuestions && !submission.questionsSentAt && (
        <p className="adm-hint">
          <button type="button" className="adm-linkbtn" disabled={busy !== null} onClick={sendQuestions}>
            {busy === "questions" ? "Wird gesendet …" : "Reflexionsfragen trotzdem senden"}
          </button>
        </p>
      )}

      <div className="adm-field">
        <label htmlFor={`note-${submission.id}`}>Notiz nur für dich</label>
        <textarea
          id={`note-${submission.id}`}
          rows={3}
          value={note}
          maxLength={4000}
          placeholder="z. B. Termin vereinbart, zurückrufen …"
          onChange={(e) => setNote(e.target.value)}
          onBlur={saveNote}
        />
        <span className="adm-saved" aria-live="polite">
          {busy === "note" ? "Speichert …" : noteSaved ? "Gespeichert" : ""}
        </span>
      </div>

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}

      <footer className="adm-detail-foot">
        <button
          type="button"
          className="adm-linkbtn"
          disabled={busy !== null}
          onClick={() => setStatus(archived ? "read" : "archived")}
        >
          {archived ? (
            <ArchiveRestore className="ic" strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <Archive className="ic" strokeWidth={1.6} aria-hidden="true" />
          )}
          {archived ? "Aus dem Archiv holen" : "Archivieren"}
        </button>

        {confirmDelete ? (
          <span className="adm-confirm" role="alertdialog" aria-label="Löschen bestätigen">
            Endgültig löschen?
            <button type="button" className="adm-linkbtn danger" disabled={busy !== null} onClick={remove}>
              {busy === "delete" ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <Check className="ic" strokeWidth={1.6} aria-hidden="true" />}
              Ja, löschen
            </button>
            <button type="button" className="adm-linkbtn" onClick={() => setConfirmDelete(false)}>
              Abbrechen
            </button>
          </span>
        ) : (
          <button type="button" className="adm-linkbtn danger" disabled={busy !== null} onClick={() => setConfirmDelete(true)}>
            <Trash2 className="ic" strokeWidth={1.6} aria-hidden="true" />
            Löschen
          </button>
        )}
      </footer>
    </article>
  );
}
