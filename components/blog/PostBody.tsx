import Image from "next/image";
import type { PostBlock } from "@/types/post";

function ExternalOrInternal({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      className={className}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

// Gemeinsam für die öffentliche Beitragsseite und die Vorschau im Admin.
export default function PostBody({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="pb-body">
      {blocks.map((block) => {
        switch (block.type) {
          case "paragraph":
            // Leerzeile im Text = neuer Absatz; einfache Zeilenumbrüche bleiben erhalten.
            return block.text
              .split(/\n{2,}/)
              .filter((part) => part.trim())
              .map((part, i) => (
                <p key={`${block.id}-${i}`} className="pb-p">
                  {part}
                </p>
              ));
          case "heading":
            return block.level === 3 ? (
              <h3 key={block.id} className="pb-h3">
                {block.text}
              </h3>
            ) : (
              <h2 key={block.id} className="pb-h2">
                {block.text}
              </h2>
            );
          case "image":
            return (
              <figure key={block.id} className={`pb-fig${block.width === "wide" ? " wide" : ""}`}>
                <Image
                  src={block.url}
                  alt={block.alt}
                  width={block.w ?? 1600}
                  height={block.h ?? 1000}
                  sizes={block.width === "wide" ? "(min-width: 1024px) 64rem, 100vw" : "(min-width: 768px) 42rem, 100vw"}
                  style={{ width: "100%", height: "auto" }}
                />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={block.id} className="pb-quote">
                <p>{block.text}</p>
                {block.author && <cite>{block.author}</cite>}
              </blockquote>
            );
          case "list": {
            const Tag = block.style === "number" ? "ol" : "ul";
            return (
              <Tag key={block.id} className={`pb-list ${block.style}`}>
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </Tag>
            );
          }
          case "button":
            return (
              <p key={block.id} className="pb-btn">
                <ExternalOrInternal className="btn" href={block.href}>
                  {block.label}
                </ExternalOrInternal>
              </p>
            );
          case "divider":
            return <hr key={block.id} className="pb-hr" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
