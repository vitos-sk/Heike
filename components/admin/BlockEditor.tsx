"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Heading,
  ImagePlus,
  ImageIcon,
  List,
  Loader2,
  Minus,
  MousePointerClick,
  Pilcrow,
  Plus,
  Quote,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { PostBlock } from "@/types/post";
import { uploadImage } from "@/components/admin/uploadImage";

type BlockType = PostBlock["type"];

const BLOCK_TYPES: { type: BlockType; label: string; icon: LucideIcon }[] = [
  { type: "paragraph", label: "Absatz", icon: Pilcrow },
  { type: "heading", label: "Überschrift", icon: Heading },
  { type: "image", label: "Bild", icon: ImageIcon },
  { type: "quote", label: "Zitat", icon: Quote },
  { type: "list", label: "Liste", icon: List },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "divider", label: "Trenner", icon: Minus },
];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

function createBlock(type: BlockType): PostBlock {
  const id = newId();
  switch (type) {
    case "paragraph":
      return { id, type, text: "" };
    case "heading":
      return { id, type, text: "", level: 2 };
    case "image":
      return { id, type, url: "", alt: "", caption: null, width: "normal" };
    case "quote":
      return { id, type, text: "", author: null };
    case "list":
      return { id, type, style: "bullet", items: [""] };
    case "button":
      return { id, type, label: "", href: "" };
    case "divider":
      return { id, type };
  }
}

function duplicate(block: PostBlock): PostBlock {
  return { ...structuredClone(block), id: newId() } as PostBlock;
}

function AutoTextarea({
  value,
  onChange,
  label,
  placeholder,
  minRows = 3,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  minRows?: number;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      className={className}
      aria-label={label}
      rows={minRows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function AddTray({ onSelect, label }: { onSelect: (type: BlockType) => void; label: string }) {
  return (
    <div className="adm-tray" role="group" aria-label={label}>
      {BLOCK_TYPES.map(({ type, label: text, icon: Icon }) => (
        <button key={type} type="button" onClick={() => onSelect(type)}>
          <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
          {text}
        </button>
      ))}
    </div>
  );
}

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: Extract<PostBlock, { type: "image" }>;
  onChange: (patch: Partial<Extract<PostBlock, { type: "image" }>>) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const up = await uploadImage(file);
      onChange({ url: up.url, w: up.width, h: up.height });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adm-imgblock">
      {block.url ? (
        <div className="adm-imgprev">
          <Image src={block.url} alt={block.alt || ""} width={block.w ?? 800} height={block.h ?? 500} sizes="30rem" />
          <button type="button" className="adm-iconbtn" onClick={() => onChange({ url: "", w: undefined, h: undefined })} aria-label="Bild entfernen">
            <X className="ic" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" className="adm-drop" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="ic adm-spin" aria-hidden="true" /> : <ImagePlus className="ic" strokeWidth={1.6} aria-hidden="true" />}
          {uploading ? "Wird hochgeladen …" : "Bild auswählen (JPG, PNG, WebP · max. 8 MB)"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={pick} />
      {block.url && (
        <button type="button" className="adm-linkbtn" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? "Wird hochgeladen …" : "Anderes Bild wählen"}
        </button>
      )}
      {error && (
        <p className="adm-error" role="alert">
          {error}
        </p>
      )}
      <label className="adm-lbl">
        Bildbeschreibung (für Screenreader und Suchmaschinen)
        <input value={block.alt} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Was ist auf dem Bild zu sehen?" />
      </label>
      <label className="adm-lbl">
        Bildunterschrift (optional)
        <input value={block.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value || null })} />
      </label>
      <div className="adm-seg" role="radiogroup" aria-label="Breite">
        {(["normal", "wide"] as const).map((w) => (
          <button key={w} type="button" role="radio" aria-checked={block.width === w} className={block.width === w ? "on" : undefined} onClick={() => onChange({ width: w })}>
            {w === "normal" ? "Textbreite" : "Volle Breite"}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: PostBlock[];
  onChange: (blocks: PostBlock[]) => void;
}) {
  const [insertAt, setInsertAt] = useState<number | null>(null);

  const update = (index: number, patch: Partial<PostBlock>) =>
    onChange(blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as PostBlock) : b)));

  const remove = (index: number) => onChange(blocks.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const insert = (position: number, type: BlockType) => {
    const next = [...blocks];
    next.splice(position, 0, createBlock(type));
    onChange(next);
    setInsertAt(null);
  };

  const dup = (index: number) => {
    const next = [...blocks];
    next.splice(index + 1, 0, duplicate(blocks[index]));
    onChange(next);
  };

  return (
    <div className="adm-blocks">
      {blocks.length === 0 && (
        <p className="adm-muted adm-blocks-empty">
          Noch kein Inhalt. Füge unten den ersten Block hinzu – zum Beispiel einen Absatz.
        </p>
      )}

      <ol>
        {blocks.map((block, index) => {
          const meta = BLOCK_TYPES.find((t) => t.type === block.type)!;
          const Icon = meta.icon;
          return (
            <li key={block.id} className="adm-block">
              <div className="adm-block-bar">
                <span className="kind">
                  <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
                  {meta.label}
                </span>
                <span className="acts">
                  <button type="button" className="adm-iconbtn" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`${meta.label} nach oben`}>
                    <ArrowUp className="ic" strokeWidth={1.6} aria-hidden="true" />
                  </button>
                  <button type="button" className="adm-iconbtn" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label={`${meta.label} nach unten`}>
                    <ArrowDown className="ic" strokeWidth={1.6} aria-hidden="true" />
                  </button>
                  <button type="button" className="adm-iconbtn" onClick={() => dup(index)} aria-label={`${meta.label} duplizieren`}>
                    <Copy className="ic" strokeWidth={1.6} aria-hidden="true" />
                  </button>
                  <button type="button" className="adm-iconbtn danger" onClick={() => remove(index)} aria-label={`${meta.label} löschen`}>
                    <Trash2 className="ic" strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </span>
              </div>

              <div className="adm-block-body">
                {block.type === "paragraph" && (
                  <AutoTextarea label="Absatz" value={block.text} onChange={(text) => update(index, { text })} placeholder="Schreib hier deinen Text …" minRows={4} />
                )}

                {block.type === "heading" && (
                  <div className="adm-row">
                    <input
                      className="adm-ttl"
                      aria-label="Überschrift"
                      value={block.text}
                      placeholder="Überschrift"
                      onChange={(e) => update(index, { text: e.target.value })}
                    />
                    <div className="adm-seg" role="radiogroup" aria-label="Ebene">
                      {([2, 3] as const).map((level) => (
                        <button key={level} type="button" role="radio" aria-checked={block.level === level} className={block.level === level ? "on" : undefined} onClick={() => update(index, { level })}>
                          {level === 2 ? "Groß" : "Klein"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "image" && (
                  <ImageBlockEditor block={block} onChange={(patch) => update(index, patch)} />
                )}

                {block.type === "quote" && (
                  <>
                    <AutoTextarea label="Zitat" value={block.text} onChange={(text) => update(index, { text })} placeholder="Zitat" minRows={2} />
                    <label className="adm-lbl">
                      Von wem? (optional)
                      <input value={block.author ?? ""} onChange={(e) => update(index, { author: e.target.value || null })} />
                    </label>
                  </>
                )}

                {block.type === "list" && (
                  <>
                    <div className="adm-seg" role="radiogroup" aria-label="Listenart">
                      {(["bullet", "number"] as const).map((style) => (
                        <button key={style} type="button" role="radio" aria-checked={block.style === style} className={block.style === style ? "on" : undefined} onClick={() => update(index, { style })}>
                          {style === "bullet" ? "Aufzählung" : "Nummeriert"}
                        </button>
                      ))}
                    </div>
                    <AutoTextarea
                      label="Listenpunkte, einer pro Zeile"
                      value={block.items.join("\n")}
                      onChange={(text) => update(index, { items: text.split("\n") })}
                      placeholder={"Ein Punkt pro Zeile\nNoch ein Punkt"}
                      minRows={3}
                    />
                  </>
                )}

                {block.type === "button" && (
                  <div className="adm-row adm-row--2">
                    <label className="adm-lbl">
                      Beschriftung
                      <input value={block.label} placeholder="Jetzt anmelden" onChange={(e) => update(index, { label: e.target.value })} />
                    </label>
                    <label className="adm-lbl">
                      Ziel
                      <input value={block.href} placeholder="#contact oder https://…" onChange={(e) => update(index, { href: e.target.value })} />
                    </label>
                  </div>
                )}

                {block.type === "divider" && <hr className="adm-hr" aria-label="Trennlinie" />}
              </div>

              {insertAt === index + 1 ? (
                <AddTray onSelect={(type) => insert(index + 1, type)} label="Block darunter einfügen" />
              ) : (
                <button type="button" className="adm-insert" onClick={() => setInsertAt(index + 1)}>
                  <Plus className="ic" strokeWidth={1.6} aria-hidden="true" />
                  Darunter einfügen
                </button>
              )}
            </li>
          );
        })}
      </ol>

      <div className="adm-add">
        <p>Block hinzufügen</p>
        <AddTray onSelect={(type) => insert(blocks.length, type)} label="Block am Ende hinzufügen" />
      </div>
    </div>
  );
}
