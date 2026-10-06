"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Мягкое появление: элементам с классом `rv` добавляется `in`, когда они
// попадают в экран. Без JS и при prefers-reduced-motion всё видно сразу (см. CSS).
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".rv:not(.in)"));
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
