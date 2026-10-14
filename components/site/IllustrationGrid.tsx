"use client";

import { useCallback, useEffect, useState } from "react";
import type { Illustration } from "@/lib/types";

export default function IllustrationGrid({ items }: { items: Illustration[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length]
  );

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

  const active = index !== null ? items[index] : null;

  return (
    <>
      <div className="illo-grid">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={`illo illo-${it.color} reveal${it.imageId ? " has-img" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Open ${it.title}`}
          >
            {it.imageId ? (
              <img src={`/api/media/${it.imageId}`} alt="" loading="lazy" />
            ) : (
              <div className="blobshape" />
            )}
            <div className="cap">
              <div className="t">{it.title}</div>
              <div className="m">{it.caption}</div>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title} onClick={close}>
          <figure onClick={(e) => e.stopPropagation()}>
            {active.imageId ? (
              <img src={`/api/media/${active.imageId}`} alt={active.title} />
            ) : (
              <div className={`lb-swatch illo-${active.color}`}>
                <div className="illo" style={{ position: "absolute", inset: 0, border: 0, cursor: "default" }}>
                  <div className="blobshape" />
                </div>
              </div>
            )}
            <figcaption>
              <div className="t">{active.title}</div>
              <div className="m mono">{active.caption}</div>
            </figcaption>
          </figure>
          <button className="lb-btn lb-close" aria-label="Close" onClick={close}>✕</button>
          {items.length > 1 && (
            <>
              <button className="lb-btn lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); step(-1); }}>←</button>
              <button className="lb-btn lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); step(1); }}>→</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
