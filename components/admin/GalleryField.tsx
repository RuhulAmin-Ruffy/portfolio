"use client";

import { useState } from "react";
import MediaPicker from "./MediaPicker";

export default function GalleryField({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const move = (i: number, d: number) => {
    const next = [...value];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <>
      <div className="gallery">
        {value.map((id, i) => (
          <div className="item" key={id}>
            <img src={`/api/media/${id}`} alt="" />
            <span className="idx">{i + 1}</span>
            <div className="tools">
              <button type="button" aria-label="Move left" onClick={() => move(i, -1)}>←</button>
              <button type="button" aria-label="Move right" onClick={() => move(i, 1)}>→</button>
              <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((x) => x !== id))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="add" onClick={() => setOpen(true)}>+ Add images</button>
      </div>
      {open && (
        <MediaPicker
          multiple
          onClose={() => setOpen(false)}
          onSelect={(ids) => {
            onChange([...value, ...ids.filter((id) => !value.includes(id))]);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
