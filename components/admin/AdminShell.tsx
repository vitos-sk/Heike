"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Mail,
  PenLine,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Mail;
  badge?: number;
  badgeTone?: "alert" | "quiet";
};

export default function AdminShell({
  unread,
  drafts,
  email,
  children,
}: {
  unread: number;
  drafts: number;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  const items: NavItem[] = [
    { href: "/admin", label: "Übersicht", icon: LayoutDashboard },
    { href: "/admin/briefe", label: "Briefe", icon: Mail, badge: unread, badgeTone: "alert" },
    { href: "/admin/blog", label: "Blog", icon: PenLine, badge: drafts, badgeTone: "quiet" },
    { href: "/admin/fragen", label: "Fragen", icon: ListChecks },
    { href: "/admin/zugang", label: "Zugang", icon: KeyRound },
  ];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

  async function logout() {
    setLeaving(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="adm">
      <aside className="adm-side" aria-label="Admin-Navigation">
        <Link href="/admin" className="adm-brand">
          <Image src="/logo.png" alt="" width={788} height={771} sizes="3rem" />
          <span>
            <b>Heike Schaub</b>
            <small>Verwaltung</small>
          </span>
        </Link>

        <nav className="adm-nav">
          {items.map(({ href, label, icon: Icon, badge, badgeTone }) => (
            <Link
              key={href}
              href={href}
              className={isActive(href) ? "on" : undefined}
              aria-current={isActive(href) ? "page" : undefined}
            >
              <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
              <span className="lbl">{label}</span>
              {badge ? (
                <span className={`adm-badge adm-badge--${badgeTone}`} aria-label={`${badge}`}>
                  {badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener noreferrer" className="adm-side-link">
            <ExternalLink className="ic" strokeWidth={1.6} aria-hidden="true" />
            Website ansehen
          </a>
          <p className="adm-who" title={email}>
            {email}
          </p>
          <button type="button" className="adm-side-link" onClick={logout} disabled={leaving}>
            {leaving ? (
              <Loader2 className="ic adm-spin" strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <LogOut className="ic" strokeWidth={1.6} aria-hidden="true" />
            )}
            Abmelden
          </button>
        </div>
      </aside>

      <header className="adm-top">
        <Link href="/admin" className="adm-brand adm-brand--sm">
          <Image src="/logo.png" alt="" width={788} height={771} sizes="2.5rem" />
          <b>Verwaltung</b>
        </Link>
        <div className="adm-top-act">
          <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Website ansehen">
            <ExternalLink className="ic" strokeWidth={1.6} aria-hidden="true" />
          </a>
          <button type="button" onClick={logout} disabled={leaving} aria-label="Abmelden">
            <LogOut className="ic" strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="adm-main" id="adm-main">
        {children}
      </main>

      <nav className="adm-tabs" aria-label="Admin-Navigation">
        {items.map(({ href, label, icon: Icon, badge, badgeTone }) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? "on" : undefined}
            aria-current={isActive(href) ? "page" : undefined}
          >
            <span className="tab-ic">
              <Icon className="ic" strokeWidth={1.6} aria-hidden="true" />
              {badge ? <i className={`adm-dot adm-dot--${badgeTone}`} aria-hidden="true" /> : null}
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
