"use client";

import { useState } from "react";
import MediaPicker from "./MediaPicker";

export default function ImageField({
  value,
  onChange,
  round = false,
  emptyLabel = "No image",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  round?: boolean;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="imgfield">
      <div className={`preview${round ? " round" : ""}${value ? " filled" : ""}`}>
        {value ? <img src={`/api/media/${value}`} alt="" /> : <span>{emptyLabel}</span>}
      </div>
      <div className="btns">
        <button type="button" className="b b-sm" onClick={() => setOpen(true)}>
          {value ? "Replace" : "Upload / choose"}
        </button>
        {value && (
          <button type="button" className="b b-sm b-danger" onClick={() => onChange(null)}>Remove</button>
        )}
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(ids) => { onChange(ids[0] ?? null); setOpen(false); }}
        />
      )}
    </div>
  );
}
