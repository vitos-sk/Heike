"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, ImagePlus, Loader2, Save, X } from "lucide-react";
import { api } from "@/components/admin/api";
import { uploadImage } from "@/components/admin/uploadImage";
import BlockEditor from "@/components/admin/BlockEditor";
import PostPreview from "@/components/admin/PostPreview";
import { slugify } from "@/lib/slug";
import { excerptFromBlocks } from "@/lib/postContent";
import { toDateTimeLocalValue } from "@/lib/postDate";
import { EXCERPT_MAX_LENGTH, POST_TYPE_LABELS, type Post, type PostBlock, type PostType } from "@/types/post";

type Form = {
  type: PostType;
  title: string;
  slug: string;
  slugTouched: boolean;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string;
  blocks: PostBlock[];
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventCtaLabel: string;
  eventCtaHref: string;
  status: "draft" | "published";
  publishedAt: number;
  pinned: boolean;
};

type SlugState = { state: "idle" | "checking" | "free" | "taken"; suggestion?: string };

const TYPES: PostType[] = ["article", "announcement", "event"];

function fromPost(post: Post | undefined): Form {
  return {
    type: post?.type ?? "article",
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    slugTouched: Boolean(post),
    excerpt: post?.excerpt ?? "",
    coverImageUrl: post?.coverImageUrl ?? null,
    coverImageAlt: post?.coverImageAlt ?? "",
    blocks: post?.blocks ?? [],
    eventDate: post?.eventDate ?? "",
    eventTime: post?.eventTime ?? "",
    eventLocation: post?.eventLocation ?? "",
    eventCtaLabel: post?.eventCtaLabel ?? "",
    eventCtaHref: post?.eventCtaHref ?? "",
    status: post?.status ?? "draft",
    publishedAt: post?.publishedAt ?? Date.now(),
    pinned: post?.pinned ?? false,
  };
}

// Die Zeit wird absichtlich nicht in den Vergleich "ungespeichert?" einbezogen.
const snapshot = (form: Form) => JSON.stringify({ ...form, publishedAt: Math.floor(form.publishedAt / 60000) });

export default function PostForm({ initialPost }: { initialPost?: Post }) {
  const router = useRouter();
  const isEditing = Boolean(initialPost);
  const storageKey = `heike-post-draft:${initialPost?.id ?? "new"}`;

  const initial = useMemo(() => fromPost(initialPost), [initialPost]);
  const [form, setForm] = useState<Form>(initial);
  const baseline = useRef(snapshot(initial));
  const [restorable, setRestorable] = useState<{ form: Form; savedAt: number } | null>(null);
  const [slugCheck, setSlugCheck] = useState<SlugState>({ state: "idle" });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const coverInput = useRef<HTMLInputElement>(null);

  const set = useCallback(<K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const dirty = snapshot(form) !== baseline.current;

  // Entwurf in der Zwischenablage des Browsers sichern (Absturz, Akku leer, Netz weg).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { form: Form; savedAt: number };
        if (parsed?.form && snapshot(parsed.form) !== baseline.current) setRestorable(parsed);
      }
    } catch {
      /* localStorage nicht verfügbar */
    }
  }, [storageKey]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ form, savedAt: Date.now() }));
      } catch {
        /* ignorieren */
      }
    }, 800);
    return () => clearTimeout(t);
  }, [form, dirty, storageKey]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Link-Adresse prüfen (verzögert)
  useEffect(() => {
    const slug = slugify(form.slug);
    if (!slug) {
      setSlugCheck({ state: "idle" });
      return;
    }
    setSlugCheck({ state: "checking" });
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ slug });
        if (initialPost) params.set("exceptId", initialPost.id);
        const res = await fetch(`/api/admin/posts/slug-check?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { available: boolean; suggestion: string };
        setSlugCheck(data.available ? { state: "free" } : { state: "taken", suggestion: data.suggestion });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setSlugCheck({ state: "idle" });
      }
    }, 450);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [form.slug, initialPost]);

  function onTitle(value: string) {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: prev.slugTouched ? prev.slug : slugify(value),
    }));
    setSaved(false);
  }

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const up = await uploadImage(file);
      set("coverImageUrl", up.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingCover(false);
    }
  }

  function validate(): string | null {
    if (!form.title.trim()) return "Bitte gib dem Beitrag einen Titel.";
    if (!slugify(form.slug || form.title)) return "Die Link-Adresse darf nicht leer sein.";
    if (form.type === "event" && !form.eventDate) return "Bitte wähle das Datum des Events.";
    if (form.coverImageUrl && !form.coverImageAlt.trim()) return "Bitte beschreibe das Titelbild kurz (für Screenreader).";
    if (form.blocks.some((b) => b.type === "image" && b.url && !b.alt.trim())) return "Bitte beschreibe alle Bilder im Text kurz.";
    return null;
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);

    const body = {
      type: form.type,
      title: form.title,
      slug: slugify(form.slug || form.title),
      excerpt: form.excerpt,
      coverImageUrl: form.coverImageUrl,
      coverImageAlt: form.coverImageAlt,
      blocks: form.blocks,
      eventDate: form.eventDate || null,
      eventTime: form.eventTime || null,
      eventLocation: form.eventLocation || null,
      eventCtaLabel: form.eventCtaLabel || null,
      eventCtaHref: form.eventCtaHref || null,
      status: form.status,
      publishedAt: form.publishedAt,
      pinned: form.pinned,
    };

    try {
      if (initialPost) {
        await api(`/api/admin/posts/${initialPost.id}`, { method: "PUT", body: JSON.stringify(body) });
        baseline.current = snapshot(form);
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* ignorieren */
        }
        setSaved(true);
        router.refresh();
      } else {
        const created = await api<{ id: string }>("/api/admin/posts", { method: "POST", body: JSON.stringify(body) });
        baseline.current = snapshot(form);
        try {
          localStorage.removeItem(storageKey);
        } catch {
          /* ignorieren */
        }
        router.replace(`/admin/blog/${created.id}`);
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const wasPublished = initialPost?.status === "published";
  const saveLabel =
    form.status === "published" ? (wasPublished ? "Änderungen speichern" : "Veröffentlichen") : "Entwurf speichern";
  const futureDate = form.status === "published" && form.publishedAt > Date.now() + 60_000;
  const suggestion = excerptFromBlocks(form.blocks);

  return (
    <form className="adm-page adm-form" onSubmit={submit} noValidate>
      <header className="adm-head">
        <Link href="/admin/blog" className="adm-back">
          <ArrowLeft className="ic" strokeWidth={1.6} aria-hidden="true" />
          Alle Beiträge
        </Link>
        <h1 className="adm-h1">{isEditing ? "Beitrag bearbeiten" : "Neuer Beitrag"}</h1>
      </header>

      {restorable && (
        <div className="adm-banner" role="status">
          <p>
            Es gibt einen ungespeicherten Stand von{" "}
            {new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short" }).format(restorable.savedAt)}.
          </p>
          <span>
            <button
              type="button"
              className="adm-linkbtn"
              onClick={() => {
                setForm(restorable.form);
                setRestorable(null);
              }}
            >
              Wiederherstellen
            </button>
            <button
              type="button"
              className="adm-linkbtn"
              onClick={() => {
                try {
                  localStorage.removeItem(storageKey);
                } catch {
                  /* ignorieren */
                }
                setRestorable(null);
              }}
            >
              Verwerfen
            </button>
          </span>
        </div>
      )}

      <section className="adm-card">
        <h2 className="adm-h3">Grundlagen</h2>

        <div className="adm-seg adm-seg--wide" role="radiogroup" aria-label="Art des Beitrags">
          {TYPES.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={form.type === t} className={form.type === t ? "on" : undefined} onClick={() => set("type", t)}>
              {POST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <label className="adm-lbl">
          Titel
          <input className="adm-ttl" value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="Worum geht es?" maxLength={160} required />
        </label>

        <label className="adm-lbl">
          Link-Adresse
          <span className="adm-slug">
            <span className="pre">/blog/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, slug: e.target.value, slugTouched: true }));
                setSaved(false);
              }}
              onBlur={() => set("slug", slugify(form.slug))}
              aria-describedby="slug-state"
            />
          </span>
          <span id="slug-state" className={`adm-slug-state ${slugCheck.state}`} aria-live="polite">
            {slugCheck.state === "checking" && "Wird geprüft …"}
            {slugCheck.state === "free" && (
              <>
                <Check className="ic" strokeWidth={1.8} aria-hidden="true" /> Frei
              </>
            )}
            {slugCheck.state === "taken" && (
              <>
                Schon vergeben.{" "}
                <button type="button" className="adm-linkbtn" onClick={() => set("slug", slugCheck.suggestion ?? form.slug)}>
                  „{slugCheck.suggestion}“ nehmen
                </button>
              </>
            )}
          </span>
        </label>

        <label className="adm-lbl">
          Kurzbeschreibung <span className="adm-count">{form.excerpt.length}/{EXCERPT_MAX_LENGTH}</span>
          <textarea
            rows={2}
            maxLength={EXCERPT_MAX_LENGTH}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Ein bis zwei Sätze – erscheint in der Übersicht und beim Teilen."
          />
          {!form.excerpt && suggestion && (
            <button type="button" className="adm-linkbtn" onClick={() => set("excerpt", suggestion)}>
              Aus dem ersten Absatz übernehmen
            </button>
          )}
        </label>
      </section>

      {form.type === "event" && (
        <section className="adm-card">
          <h2 className="adm-h3">Event</h2>
          <div className="adm-row adm-row--2">
            <label className="adm-lbl">
              Datum
              <input type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} required />
            </label>
            <label className="adm-lbl">
              Uhrzeit (optional)
              <input value={form.eventTime} placeholder="z. B. 18:30 Uhr" onChange={(e) => set("eventTime", e.target.value)} />
            </label>
          </div>
          <label className="adm-lbl">
            Ort (optional)
            <input value={form.eventLocation} placeholder="z. B. Gemeindehaus, Hauptstraße 1" onChange={(e) => set("eventLocation", e.target.value)} />
          </label>
          <div className="adm-row adm-row--2">
            <label className="adm-lbl">
              Button – Beschriftung (optional)
              <input value={form.eventCtaLabel} placeholder="Jetzt anmelden" onChange={(e) => set("eventCtaLabel", e.target.value)} />
            </label>
            <label className="adm-lbl">
              Button – Ziel
              <input value={form.eventCtaHref} placeholder="#contact oder https://…" onChange={(e) => set("eventCtaHref", e.target.value)} />
            </label>
          </div>
        </section>
      )}

      <section className="adm-card">
        <h2 className="adm-h3">Titelbild</h2>
        {form.coverImageUrl ? (
          <div className="adm-cover">
            <Image src={form.coverImageUrl} alt="" width={800} height={450} sizes="30rem" />
            <button type="button" className="adm-iconbtn" aria-label="Titelbild entfernen" onClick={() => set("coverImageUrl", null)}>
              <X className="ic" strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button type="button" className="adm-drop" onClick={() => coverInput.current?.click()} disabled={uploadingCover}>
            {uploadingCover ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <ImagePlus className="ic" strokeWidth={1.6} aria-hidden="true" />}
            {uploadingCover ? "Wird hochgeladen …" : "Titelbild auswählen (JPG, PNG, WebP · max. 8 MB)"}
          </button>
        )}
        <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={onCover} />
        {form.coverImageUrl && (
          <>
            <button type="button" className="adm-linkbtn" onClick={() => coverInput.current?.click()} disabled={uploadingCover}>
              Anderes Bild wählen
            </button>
            <label className="adm-lbl">
              Bildbeschreibung
              <input value={form.coverImageAlt} onChange={(e) => set("coverImageAlt", e.target.value)} placeholder="Was ist auf dem Bild zu sehen?" />
            </label>
          </>
        )}
      </section>

      <section className="adm-card">
        <h2 className="adm-h3">Inhalt</h2>
        <BlockEditor blocks={form.blocks} onChange={(blocks) => set("blocks", blocks)} />
      </section>

      <section className="adm-card">
        <h2 className="adm-h3">Veröffentlichung</h2>
        <div className="adm-seg adm-seg--wide" role="radiogroup" aria-label="Status">
          {(["draft", "published"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={form.status === s} className={form.status === s ? "on" : undefined} onClick={() => set("status", s)}>
              {s === "draft" ? "Entwurf – nur für dich" : "Veröffentlicht – für alle sichtbar"}
            </button>
          ))}
        </div>

        <label className="adm-lbl">
          Veröffentlichungsdatum
          <input
            type="datetime-local"
            value={toDateTimeLocalValue(form.publishedAt)}
            onChange={(e) => {
              const t = new Date(e.target.value).getTime();
              if (!Number.isNaN(t)) set("publishedAt", t);
            }}
          />
          {futureDate && <span className="adm-hint">Liegt in der Zukunft: Der Beitrag erscheint dann automatisch (spätestens nach wenigen Minuten).</span>}
        </label>

        <label className="adm-check">
          <input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} />
          <span>Oben anheften – erscheint vor allen anderen Beiträgen</span>
        </label>
      </section>

      <div className="adm-savebar" role="region" aria-label="Speichern">
        <p className="state" aria-live="polite">
          {saving ? "Wird gespeichert …" : saved && !dirty ? "Gespeichert ✓" : dirty ? "Ungespeicherte Änderungen" : "Alles gespeichert"}
        </p>
        {error && (
          <p className="adm-error" role="alert">
            {error}
          </p>
        )}
        <div className="acts">
          <button type="button" className="btn btn--ghost" onClick={() => setShowPreview(true)}>
            <Eye className="ic" strokeWidth={1.6} aria-hidden="true" />
            Vorschau
          </button>
          <button type="submit" className="btn" disabled={saving || slugCheck.state === "taken"}>
            {saving ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <Save className="ic" strokeWidth={1.6} aria-hidden="true" />}
            {saveLabel}
          </button>
        </div>
      </div>

      {showPreview && (
        <PostPreview
          post={{
            type: form.type,
            title: form.title,
            excerpt: form.excerpt,
            coverImageUrl: form.coverImageUrl,
            coverImageAlt: form.coverImageAlt,
            blocks: form.blocks,
            eventDate: form.eventDate || null,
            eventTime: form.eventTime || null,
            eventLocation: form.eventLocation || null,
            eventCtaLabel: form.eventCtaLabel || null,
            eventCtaHref: form.eventCtaHref || null,
            publishedAt: form.publishedAt,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
}
