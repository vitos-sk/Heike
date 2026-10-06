import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, ExternalLink, ListChecks, Mail, PenLine, Plus } from "lucide-react";
import { listSubmissions } from "@/lib/submissions";
import { listPosts } from "@/lib/posts";
import { getAdminAccount } from "@/lib/adminAccount";
import { getQuestionnaire } from "@/lib/questionnaire";
import { isMailConfigured } from "@/lib/mail";
import { formatDateTime, formatRelative } from "@/lib/postDate";
import { POST_TYPE_LABELS } from "@/types/post";

export const metadata = { title: "Übersicht" };

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()),
  );
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export default async function OverviewPage() {
  const [submissions, posts, questionnaire, account] = await Promise.all([
    listSubmissions(),
    listPosts(),
    getQuestionnaire(),
    getAdminAccount().catch(() => null),
  ]);

  const unread = submissions.filter((s) => s.status === "new");
  const openQuestions = submissions.filter(
    (s) => s.wantsQuestions && !s.questionsSentAt && s.status !== "archived",
  );
  const drafts = posts.filter((p) => p.status === "draft");
  const published = posts.filter((p) => p.status === "published");
  const latest = submissions.filter((s) => s.status !== "archived").slice(0, 4);
  const recentPosts = [...posts].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3);

  const mailOk = isMailConfigured();
  const dateLabel = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Berlin",
  }).format(new Date());

  return (
    <div className="adm-page">
      <header className="adm-head">
        <p className="adm-date">{dateLabel}</p>
        <h1 className="adm-h1">{greeting()}, Heike.</h1>
        <p className="adm-sub">
          {unread.length === 0
            ? "Alles gelesen – nichts wartet auf dich."
            : unread.length === 1
              ? "Eine neue Nachricht wartet auf dich."
              : `${unread.length} neue Nachrichten warten auf dich.`}
        </p>
      </header>

      <section className="adm-tiles" aria-label="Auf einen Blick">
        <Link href="/admin/briefe?f=neu" className={`adm-tile adm-tile--lead${unread.length ? " has" : ""}`}>
          <span className="n">{unread.length}</span>
          <span className="l">Neue Nachrichten</span>
          <ArrowRight className="ic go" strokeWidth={1.6} aria-hidden="true" />
        </Link>
        <Link href="/admin/briefe?f=fragen" className="adm-tile">
          <span className="n">{openQuestions.length}</span>
          <span className="l">Fragen noch nicht gesendet</span>
          <ArrowRight className="ic go" strokeWidth={1.6} aria-hidden="true" />
        </Link>
        <Link href="/admin/blog?f=entwuerfe" className="adm-tile">
          <span className="n">{drafts.length}</span>
          <span className="l">Entwürfe im Blog</span>
          <ArrowRight className="ic go" strokeWidth={1.6} aria-hidden="true" />
        </Link>
      </section>

      <div className="adm-cols">
        <section className="adm-card" aria-labelledby="ov-mail">
          <div className="adm-card-head">
            <h2 className="adm-h2" id="ov-mail">
              Letzte Nachrichten
            </h2>
            <Link href="/admin/briefe" className="adm-more">
              Alle
              <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>
          {latest.length === 0 ? (
            <p className="adm-muted">Noch keine Nachrichten. Sobald jemand das Formular auf deiner Website ausfüllt, erscheint es hier.</p>
          ) : (
            <ul className="adm-mini">
              {latest.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/briefe?id=${s.id}`}>
                    <span className={`adm-avatar${s.status === "new" ? " new" : ""}`} aria-hidden="true">
                      {s.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="txt">
                      <b>{s.name}</b>
                      <span className="pv">{s.message}</span>
                    </span>
                    <time className="when" dateTime={new Date(s.createdAt).toISOString()} title={formatDateTime(s.createdAt)}>
                      {formatRelative(s.createdAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card" aria-labelledby="ov-blog">
          <div className="adm-card-head">
            <h2 className="adm-h2" id="ov-blog">
              Blog
            </h2>
            <Link href="/admin/blog" className="adm-more">
              Alle
              <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="adm-muted">Noch kein Beitrag. Schreib deinen ersten – etwa eine Ankündigung oder einen Event.</p>
          ) : (
            <ul className="adm-mini">
              {recentPosts.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/blog/${p.id}`}>
                    <span className="adm-avatar adm-avatar--sq" aria-hidden="true">
                      <PenLine className="ic" strokeWidth={1.6} />
                    </span>
                    <span className="txt">
                      <b>{p.title}</b>
                      <span className="pv">
                        {POST_TYPE_LABELS[p.type]} · {p.status === "draft" ? "Entwurf" : "Veröffentlicht"}
                      </span>
                    </span>
                    <time className="when" dateTime={new Date(p.updatedAt).toISOString()}>
                      {formatRelative(p.updatedAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <p className="adm-foot-note">
            {published.length} veröffentlicht · {drafts.length} {drafts.length === 1 ? "Entwurf" : "Entwürfe"}
          </p>
        </section>
      </div>

      <section className="adm-quick" aria-label="Schnellzugriff">
        <Link href="/admin/blog/neu" className="btn">
          <Plus className="ic" strokeWidth={1.6} aria-hidden="true" />
          Neuer Beitrag
        </Link>
        <Link href="/admin/fragen" className="btn btn--ghost">
          <ListChecks className="ic" strokeWidth={1.6} aria-hidden="true" />
          {questionnaire.questions.length} Fragen bearbeiten
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
          <ExternalLink className="ic" strokeWidth={1.6} aria-hidden="true" />
          Website ansehen
        </a>
      </section>

      <section className="adm-status" aria-label="Systemstatus">
        <h2 className="adm-h3">Einrichtung</h2>
        <ul>
          <li className="ok">
            <CheckCircle2 className="ic" strokeWidth={1.6} aria-hidden="true" />
            Datenbank verbunden
          </li>
          <li className={mailOk ? "ok" : "warn"}>
            {mailOk ? (
              <CheckCircle2 className="ic" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <CircleAlert className="ic" strokeWidth={1.6} aria-hidden="true" />
            )}
            {mailOk
              ? "E-Mail-Versand eingerichtet"
              : "E-Mail-Versand fehlt – Benachrichtigungen und Fragen-Versand sind aus (RESEND_API_KEY)"}
          </li>
          <li className="ok">
            <Mail className="ic" strokeWidth={1.6} aria-hidden="true" />
            Angemeldet als {account?.email ?? "–"}
          </li>
        </ul>
      </section>
    </div>
  );
}
