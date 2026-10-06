import Image from "next/image";
import Link from "next/link";
import { Facebook, Info, Instagram, Mail, Phone } from "lucide-react";
import { contact, footer, header } from "@/lib/placeholder-data";
import { listPublishedPosts } from "@/lib/posts";

const telHref = `tel:+49${contact.phone.replace(/^0/, "").replace(/\s/g, "")}`;

export default async function Footer() {
  const hasPosts = (await listPublishedPosts()).length > 0;
  const instagram = contact.social.find((s) => s.label === "Instagram");
  const facebook = contact.social.find((s) => s.label === "Facebook");

  return (
    <footer className="ft on-dark">
      <div className="wrap">
        <div className="ft-cols">
          <div className="ft-brand">
            <Image src="/logo.png" alt="" width={788} height={771} sizes="5.5rem" />
            <b>{header.logoText}</b>
            <p>Gesundheit mit Herz · Für Menschen und Familien</p>
          </div>

          <nav aria-label="Seiten">
            <h3>Seiten</h3>
            <ul>
              {header.nav.map((item) => (
                <li key={item.href}>
                  <a href={`/${item.href}`}>{item.label}</a>
                </li>
              ))}
              {hasPosts && (
                <li>
                  <Link href="/blog">Aktuelles</Link>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <h3>Kontakt</h3>
            <ul>
              <li>
                <a href={telHref}>
                  <Phone className="ic" strokeWidth={1.6} aria-hidden="true" />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="ic" strokeWidth={1.6} aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
              {instagram && (
                <li>
                  <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                    <Instagram className="ic" strokeWidth={1.6} aria-hidden="true" />
                    Instagram
                  </a>
                </li>
              )}
              {facebook && (
                <li>
                  <a href={facebook.href} target="_blank" rel="noopener noreferrer">
                    <Facebook className="ic" strokeWidth={1.6} aria-hidden="true" />
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <p className="ft-disc">
          <Info className="ic" strokeWidth={1.6} aria-hidden="true" />
          <span>{footer.disclaimer}</span>
        </p>

        <div className="ft-bot">
          <span>{footer.copyright}</span>
          <nav aria-label="Rechtliches">
            {footer.links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
