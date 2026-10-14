"use client";

import { useEffect, useRef, useState } from "react";

/** LinkedIn-style clamp: three lines, then "…see more" if the text is longer. */
export default function SeeMore({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="xp-desc">
      <div ref={ref} className={open ? "" : "clamped"}>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {(overflows || open) && (
        <button type="button" className="see-more" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "see less" : "…see more"}
        </button>
      )}
    </div>
  );
}
