"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
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

type Busy = "status" | "delete" | "questions" | null;

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

  const done = submission.status === "answered" || submission.status === "archived";
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

        {done ? (
          <button type="button" className="btn btn--ghost" disabled={busy !== null} onClick={() => setStatus("read")}>
            <RotateCcw className="ic" strokeWidth={1.6} aria-hidden="true" />
            Wieder öffnen
          </button>
        ) : (
          <button type="button" className="btn btn--ghost" disabled={busy !== null} onClick={() => setStatus("answered")}>
            {busy === "status" ? <Loader2 className="ic adm-spin" /> : <CheckCheck className="ic" strokeWidth={1.6} aria-hidden="true" />}
            Als erledigt markieren
          </button>
        )}
      </div>

      {(submission.wantsQuestions || submission.questionsSentAt) && (
        <section className="adm-box" aria-label="Reflexionsfragen">
          <div className="adm-box-ic">
            <MailQuestion className="ic" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <div className="adm-box-txt">
            <h3>Die Reflexionsfragen</h3>
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

      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}

      <footer className="adm-detail-foot">
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
