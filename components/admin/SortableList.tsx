"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type ListRow = {
  id: number;
  title: string;
  sub: string;
  imageId: string | null;
  swatch?: string;
  badges: { label: string; on: boolean; onClass: string; toggle: () => Promise<unknown> }[];
};

/** Admin list with up/down reordering, quick badge toggles and edit/delete. */
export default function SortableList({
  rows: initial,
  editBase,
  reorder,
  remove,
  emptyText,
}: {
  rows: ListRow[];
  editBase: string;
  reorder: (ids: number[]) => Promise<unknown>;
  remove: (id: number) => Promise<unknown>;
  emptyText: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  const move = (i: number, d: number) => {
    const next = [...rows];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setRows(next);
    run(() => reorder(next.map((r) => r.id)));
  };

  if (rows.length === 0) return <div className="rows"><p className="empty">{emptyText}</p></div>;

  // keep local order but pick up fresh badge state after refresh
  const fresh = new Map(initial.map((r) => [r.id, r]));

  return (
    <div className="rows" style={{ opacity: pending ? 0.7 : 1, transition: "opacity .2s" }}>
      {rows.map((r0, i) => {
        const r = fresh.get(r0.id) ?? r0;
        return (
          <div className="row" key={r.id}>
            <div className="order">
              <button aria-label="Move up" disabled={i === 0 || pending} onClick={() => move(i, -1)}>▲</button>
              <button aria-label="Move down" disabled={i === rows.length - 1 || pending} onClick={() => move(i, 1)}>▼</button>
            </div>
            <Link href={`${editBase}/${r.id}`} className={`thumb${r.swatch ? ` sw-${r.swatch}` : ""}`}>
              {r.imageId && <img src={`/api/media/${r.imageId}`} alt="" loading="lazy" />}
            </Link>
            <div style={{ minWidth: 0 }}>
              <Link href={`${editBase}/${r.id}`} className="title">{r.title}</Link>
              <div className="sub">{r.sub}</div>
            </div>
            <div className="actions">
              {r.badges.map((b) => (
                <button key={b.label} className={`badge ${b.on ? b.onClass : "off"}`} disabled={pending}
                  title={`Click to toggle ${b.label.toLowerCase()}`} onClick={() => run(b.toggle)}>
                  {b.on ? "●" : "○"} {b.label}
                </button>
              ))}
              <Link href={`${editBase}/${r.id}`} className="b b-sm">Edit</Link>
              <button className="b b-sm b-danger" disabled={pending} onClick={() => {
                if (!confirm(`Delete “${r.title}”? This cannot be undone.`)) return;
                setRows((rs) => rs.filter((x) => x.id !== r.id));
                run(() => remove(r.id));
              }}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
