"use client";

import { useCallback, useEffect, useState } from "react";

type Shot = { src: string; alt: string };

/** Click any `img[data-zoom]` on the page to view it full size; arrows step through them all. */
export default function PageLightbox() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    [shots.length]
  );

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest<HTMLImageElement>("img[data-zoom]");
      if (!img) return;
      const all = Array.from(document.querySelectorAll<HTMLImageElement>("img[data-zoom]"));
      setShots(all.map((el) => ({ src: el.currentSrc || el.src, alt: el.alt })));
      setIndex(all.indexOf(img));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, close, step]);

  const active = index !== null ? shots[index] : null;
  if (!active) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.alt} onClick={close}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={active.src} alt={active.alt} />
        {shots.length > 1 && (
          <figcaption><div className="m mono">{index! + 1} / {shots.length}</div></figcaption>
        )}
      </figure>
      <button className="lb-btn lb-close" aria-label="Close" onClick={close}>✕</button>
      {shots.length > 1 && (
        <>
          <button className="lb-btn lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>←</button>
          <button className="lb-btn lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>→</button>
        </>
      )}
    </div>
  );
}
