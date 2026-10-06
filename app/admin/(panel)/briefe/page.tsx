import Link from "next/link";
import { ArrowLeft, Inbox, MailQuestion, Search } from "lucide-react";
import { listSubmissions } from "@/lib/submissions";
import { getQuestionnaire } from "@/lib/questionnaire";
import { formatRelative } from "@/lib/postDate";
import SubmissionDetail from "@/components/admin/SubmissionDetail";
import type { Submission } from "@/types/submission";

export const metadata = { title: "Briefe" };

const FILTERS = [
  { id: "alle", label: "Alle" },
  { id: "neu", label: "Neu" },
  { id: "fragen", label: "Fragen offen" },
  { id: "beantwortet", label: "Beantwortet" },
  { id: "archiv", label: "Archiv" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

function matches(s: Submission, filter: FilterId): boolean {
  switch (filter) {
    case "alle":
      return s.status !== "archived";
    case "neu":
      return s.status === "new";
    case "fragen":
      return s.wantsQuestions && !s.questionsSentAt && s.status !== "archived";
    case "beantwortet":
      return s.status === "answered";
    case "archiv":
      return s.status === "archived";
  }
}

function href(params: { id?: string; f?: string; q?: string }): string {
  const sp = new URLSearchParams();
  if (params.f && params.f !== "alle") sp.set("f", params.f);
  if (params.q) sp.set("q", params.q);
  if (params.id) sp.set("id", params.id);
  const qs = sp.toString();
  return qs ? `/admin/briefe?${qs}` : "/admin/briefe";
}

export default async function MailPage({
  searchParams,
}: {
  searchParams: { id?: string; f?: string; q?: string };
}) {
  const [all, questionnaire] = await Promise.all([listSubmissions(), getQuestionnaire()]);

  const filter: FilterId = FILTERS.some((f) => f.id === searchParams.f)
    ? (searchParams.f as FilterId)
    : "alle";
  const q = (searchParams.q ?? "").trim();
  const needle = q.toLowerCase();

  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, all.filter((s) => matches(s, f.id)).length])) as Record<FilterId, number>;

  const list = all
    .filter((s) => matches(s, filter))
    .filter((s) => !needle || `${s.name} ${s.email} ${s.message}`.toLowerCase().includes(needle));

  const selected = searchParams.id ? (all.find((s) => s.id === searchParams.id) ?? null) : null;

  return (
    <div className="adm-page adm-page--wide">
      <header className="adm-head">
        <h1 className="adm-h1">Briefe</h1>
        <p className="adm-sub">
          Nachrichten aus deinem Kontaktformular. {counts.neu > 0 ? `${counts.neu} neu.` : "Alles gelesen."}
        </p>
      </header>

      <div className={`adm-mail${selected ? " has-detail" : ""}`}>
        <aside className="adm-mail-list" aria-label="Nachrichten">
          <form className="adm-search" action="/admin/briefe" role="search">
            {filter !== "alle" && <input type="hidden" name="f" value={filter} />}
            <Search className="ic" strokeWidth={1.6} aria-hidden="true" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Suchen: Name, E-Mail, Text"
              aria-label="Nachrichten durchsuchen"
            />
          </form>

          <div className="adm-chips" role="tablist" aria-label="Filter">
            {FILTERS.map((f) => (
              <Link
                key={f.id}
                href={href({ f: f.id, q })}
                role="tab"
                aria-selected={filter === f.id}
                className={filter === f.id ? "on" : undefined}
              >
                {f.label}
                {counts[f.id] > 0 && <span>{counts[f.id]}</span>}
              </Link>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="adm-empty">
              <Inbox className="ic" strokeWidth={1.6} aria-hidden="true" />
              <p>
                {all.length === 0
                  ? "Noch keine Nachrichten. Sobald jemand das Formular auf deiner Website ausfüllt, erscheint es hier."
                  : "Nichts gefunden."}
              </p>
            </div>
          ) : (
            <ul className="adm-rows">
              {list.map((s) => (
                <li key={s.id}>
                  <Link
                    href={href({ id: s.id, f: filter, q })}
                    className={`${s.id === selected?.id ? "on" : ""}${s.status === "new" ? " new" : ""}`}
                    aria-current={s.id === selected?.id ? "true" : undefined}
                  >
                    <span className={`adm-avatar${s.status === "new" ? " new" : ""}`} aria-hidden="true">
                      {s.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="txt">
                      <span className="top">
                        <b>{s.name}</b>
                        <time dateTime={new Date(s.createdAt).toISOString()}>{formatRelative(s.createdAt)}</time>
                      </span>
                      <span className="pv">{s.message}</span>
                      <span className="tags">
                        {s.wantsQuestions && (
                          <span className={`adm-pill${s.questionsSentAt ? "" : " warn"}`}>
                            <MailQuestion className="ic" strokeWidth={1.6} aria-hidden="true" />
                            {s.questionsSentAt ? "Fragen gesendet" : "möchte die Fragen"}
                          </span>
                        )}
                        {s.status === "answered" && <span className="adm-pill ok">Beantwortet</span>}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="adm-mail-detail" aria-label="Nachricht">
          {selected ? (
            <>
              <Link href={href({ f: filter, q })} className="adm-back">
                <ArrowLeft className="ic" strokeWidth={1.6} aria-hidden="true" />
                Zur Liste
              </Link>
              <SubmissionDetail key={selected.id} submission={selected} questionCount={questionnaire.questions.length} />
            </>
          ) : (
            <div className="adm-empty adm-empty--pane">
              <Inbox className="ic" strokeWidth={1.6} aria-hidden="true" />
              <p>Wähle links eine Nachricht aus.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
