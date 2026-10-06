"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Mail, Menu, Phone, X } from "lucide-react";
import { contact, header } from "@/lib/placeholder-data";

const SECTION_IDS = ["home", "services", "kindergesundheit", "konzept", "about", "contact"];
const telHref = `tel:+49${contact.phone.replace(/^0/, "").replace(/\s/g, "")}`;

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const base = isHome ? "" : "/";

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Фон/размер при прокрутке
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Активный пункт меню (точка под текстом)
  useEffect(() => {
    if (!isHome) {
      setActive(null);
      return;
    }
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el,
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id === "home" ? null : entry.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  // Мобильное меню: блокировка прокрутки, Esc, закрытие при расширении окна
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 960) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`hdr${scrolled ? " is-scrolled" : ""}`}>
        <div className="wrap hdr-in">
          <a className="hdr-brand" href={`${base}#home`} aria-label={`${header.logoText} – Startseite`}>
            <Image src="/logo.png" alt="" width={788} height={771} priority sizes="3rem" />
            <span className="hdr-name">{header.logoText}</span>
          </a>

          <nav className="hdr-nav" aria-label="Hauptnavigation">
            {header.nav.map((item) => {
              const id = item.href.slice(1);
              const on = active === id;
              return (
                <a
                  key={item.href}
                  href={`${base}${item.href}`}
                  className={on ? "on" : undefined}
                  aria-current={on ? "location" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hdr-act">
            <a className="hdr-tel" href={telHref}>
              <Phone className="ic" strokeWidth={1.6} aria-hidden="true" />
              {contact.phone}
            </a>
            <a className="btn" href={`${base}#contact`}>
              <span className="long">{header.ctaText}</span>
              <span className="short">Kennenlernen</span>
            </a>
            <button
              ref={burgerRef}
              type="button"
              className="hdr-burger"
              aria-label={header.menuLabel}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="ic m" strokeWidth={1.6} aria-hidden="true" />
              <X className="ic x" strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Отдельным элементом: у header при прокрутке есть backdrop-filter, он сломал бы position: fixed */}
      <div className="hdr-sheet" id="mobile-menu">
        <nav aria-label="Mobil">
          {header.nav.map((item) => (
            <a key={item.href} href={`${base}${item.href}`} onClick={close}>
              {item.label}
              <ArrowUpRight className="ic" strokeWidth={1.6} aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className="foot">
          <a className="row" href={telHref} onClick={close}>
            <Phone className="ic" strokeWidth={1.6} aria-hidden="true" />
            {contact.phone}
          </a>
          <a className="row" href={`mailto:${contact.email}`} onClick={close}>
            <Mail className="ic" strokeWidth={1.6} aria-hidden="true" />
            {contact.email}
          </a>
          <a className="btn" href={`${base}#contact`} onClick={close}>
            {header.ctaText}
            <ArrowRight className="ic" strokeWidth={1.6} aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}
