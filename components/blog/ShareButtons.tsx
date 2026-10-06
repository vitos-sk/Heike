"use client";

import { useState } from "react";
import { Check, Facebook, Link2, Mail, MessageCircle } from "lucide-react";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Link kopieren:", url);
    }
  }

  return (
    <div className="share" role="group" aria-label="Beitrag teilen">
      <span>Teilen</span>
      <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" aria-label="Per WhatsApp teilen">
        <MessageCircle className="ic" strokeWidth={1.6} aria-hidden="true" />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label="Auf Facebook teilen">
        <Facebook className="ic" strokeWidth={1.6} aria-hidden="true" />
      </a>
      <a href={`mailto:?subject=${t}&body=${u}`} aria-label="Per E-Mail teilen">
        <Mail className="ic" strokeWidth={1.6} aria-hidden="true" />
      </a>
      <button type="button" onClick={copy} aria-label="Link kopieren">
        {copied ? <Check className="ic" strokeWidth={1.8} aria-hidden="true" /> : <Link2 className="ic" strokeWidth={1.6} aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Link kopiert" : ""}
      </span>
    </div>
  );
}
