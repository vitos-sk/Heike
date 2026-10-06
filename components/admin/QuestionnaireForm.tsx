"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { api } from "@/components/admin/api";
import { renderQuestionnaireEmail } from "@/lib/questionnaireTemplate";
import { MAX_QUESTIONS, NAME_PLACEHOLDER, type Questionnaire } from "@/types/questionnaire";

type Item = { key: string; text: string };

let counter = 0;
const key = () => `q${++counter}`;

export default function QuestionnaireForm({
  initial,
  mailConfigured,
}: {
  initial: Questionnaire;
  mailConfigured: boolean;
}) {
  const [subject, setSubject] = useState(initial.subject);
  const [intro, setIntro] = useState(initial.intro);
  const [outro, setOutro] = useState(initial.outro);
  const [autoSend, setAutoSend] = useState(initial.autoSend);
  const [items, setItems] = useState<Item[]>(() => initial.questions.map((text) => ({ key: key(), text })));
  const [busy, setBusy] = useState<"save" | "test" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const touch = () => {
    setDirty(true);
    setMessage(null);
  };

  const filled = items.map((i) => i.text.trim()).filter(Boolean);
  const draft = { subject, intro, outro, autoSend, questions: filled };
  const preview = useMemo(
    () => renderQuestionnaireEmail({ subject, intro, outro, autoSend, questions: filled }, "Anna"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subject, intro, outro, autoSend, items],
  );

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    touch();
  }

  async function save() {
    if (filled.length === 0) {
      setMessage({ tone: "error", text: "Bitte formuliere mindestens eine Frage." });
      return;
    }
    setBusy("save");
    setMessage(null);
    try {
      await api("/api/admin/questionnaire", { method: "PUT", body: JSON.stringify(draft) });
      setItems((prev) => prev.filter((i) => i.text.trim()));
      setDirty(false);
      setMessage({ tone: "ok", text: "Gespeichert. Ab jetzt gilt diese Vorlage für alle Mails." });
    } catch (e) {
      setMessage({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function sendTest() {
    setBusy("test");
    setMessage(null);
    try {
      const res = await api<{ to: string }>("/api/admin/questionnaire/test", {
        method: "POST",
        body: JSON.stringify(draft),
      });
      setMessage({ tone: "ok", text: `Probe-Mail an ${res.to} gesendet.` });
    } catch (e) {
      setMessage({ tone: "error", text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="adm-page adm-page--wide">
      <header className="adm-head">
        <h1 className="adm-h1">Reflexionsfragen</h1>
        <p className="adm-sub">
          Diese E-Mail bekommen Besucher:innen, die „Hol dir deine 7 Reflexionsfragen“ anfordern. Rechts siehst du, wie sie ankommt.
        </p>
      </header>

      <div className="adm-qa">
        <div className="adm-qa-form">
          <section className="adm-card">
            <h2 className="adm-h3">Betreff und Einleitung</h2>
            <label className="adm-lbl">
              Betreff
              <input value={subject} onChange={(e) => { setSubject(e.target.value); touch(); }} />
            </label>
            <label className="adm-lbl">
              Einleitung
              <textarea rows={6} value={intro} onChange={(e) => { setIntro(e.target.value); touch(); }} />
              <span className="adm-hint">
                <code>{NAME_PLACEHOLDER}</code> wird durch den Namen der Person ersetzt. Leere Zeile = neuer Absatz.
              </span>
            </label>
          </section>

          <section className="adm-card">
            <div className="adm-card-head">
              <h2 className="adm-h3">
                Fragen <span className="adm-count">{filled.length}</span>
              </h2>
            </div>
            <ol className="adm-qlist">
              {items.map((item, index) => (
                <li key={item.key}>
                  <span className="n" aria-hidden="true">
                    {index + 1}
                  </span>
                  <textarea
                    rows={2}
                    aria-label={`Frage ${index + 1}`}
                    value={item.text}
                    placeholder="Deine Frage …"
                    onChange={(e) => {
                      setItems(items.map((i) => (i.key === item.key ? { ...i, text: e.target.value } : i)));
                      touch();
                    }}
                  />
                  <span className="acts">
                    <button type="button" className="adm-iconbtn" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Frage ${index + 1} nach oben`}>
                      <ArrowUp className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                    <button type="button" className="adm-iconbtn" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`Frage ${index + 1} nach unten`}>
                      <ArrowDown className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="adm-iconbtn danger"
                      onClick={() => {
                        setItems(items.filter((i) => i.key !== item.key));
                        touch();
                      }}
                      aria-label={`Frage ${index + 1} löschen`}
                    >
                      <Trash2 className="ic" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={items.length >= MAX_QUESTIONS}
              onClick={() => {
                setItems([...items, { key: key(), text: "" }]);
                touch();
              }}
            >
              <Plus className="ic" strokeWidth={1.6} aria-hidden="true" />
              Frage hinzufügen
            </button>
          </section>

          <section className="adm-card">
            <h2 className="adm-h3">Abschluss</h2>
            <label className="adm-lbl">
              Schlusstext
              <textarea rows={5} value={outro} onChange={(e) => { setOutro(e.target.value); touch(); }} />
            </label>
          </section>

          <section className="adm-card">
            <h2 className="adm-h3">Versand</h2>
            <label className="adm-check">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => {
                  setAutoSend(e.target.checked);
                  touch();
                }}
              />
              <span>
                Fragen sofort automatisch senden, wenn jemand sie anfordert
                <small>Aus: Du bekommst die Anfrage und schickst die Fragen selbst mit einem Klick.</small>
              </span>
            </label>
            {!mailConfigured && (
              <p className="adm-error" role="alert">
                E-Mail-Versand ist noch nicht eingerichtet (RESEND_API_KEY fehlt) – Versand und Probe-Mail gehen erst danach.
              </p>
            )}
          </section>
        </div>

        <aside className="adm-qa-preview" aria-label="Vorschau der E-Mail">
          <div className="adm-mailframe">
            <div className="adm-mailframe-bar">
              <span>Betreff</span>
              <b>{preview.subject}</b>
            </div>
            <iframe title="E-Mail-Vorschau" srcDoc={preview.html} sandbox="" />
          </div>
        </aside>
      </div>

      <div className="adm-savebar" role="region" aria-label="Speichern">
        <p className="state" aria-live="polite">
          {message ? (
            <span className={message.tone === "ok" ? "ok" : "adm-error"}>
              {message.tone === "ok" && <Check className="ic" strokeWidth={1.8} aria-hidden="true" />} {message.text}
            </span>
          ) : dirty ? (
            "Ungespeicherte Änderungen"
          ) : (
            "Alles gespeichert"
          )}
        </p>
        <div className="acts">
          <button type="button" className="btn btn--ghost" onClick={sendTest} disabled={busy !== null || !mailConfigured}>
            {busy === "test" ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <Send className="ic" strokeWidth={1.6} aria-hidden="true" />}
            Probe an mich
          </button>
          <button type="button" className="btn" onClick={save} disabled={busy !== null || !dirty}>
            {busy === "save" ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <Save className="ic" strokeWidth={1.6} aria-hidden="true" />}
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
