"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/types";
import { formatBytes, uploadImage } from "./upload";

type Props = {
  multiple?: boolean;
  onSelect: (ids: string[]) => void;
  onClose: () => void;
};

/** Modal: pick existing images from the library, or upload new ones. */
export default function MediaPicker({ multiple = false, onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setError("Could not load media library"));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) => {
    if (!multiple) return onSelect([id]);
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const uploaded: string[] = [];
    try {
      for (const f of Array.from(files)) {
        const m = await uploadImage(f);
        uploaded.push(m.id);
        setItems((list) => [m, ...(list ?? [])]);
      }
      if (!multiple && uploaded[0]) onSelect([uploaded[0]]);
      else setSelected((s) => [...s, ...uploaded]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Choose image" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{multiple ? "Add images" : "Choose an image"}</h3>
          <button className="b b-sm" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          <div
            className="dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
            onDragLeave={(e) => e.currentTarget.classList.remove("over")}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("over"); upload(e.dataTransfer.files); }}
          >
            {busy ? "Uploading…" : <><strong>Upload new</strong> — click or drop images here</>}
            <input ref={fileRef} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
          </div>
          {error && <p className="status err" style={{ marginBottom: 12 }}>{error}</p>}
          {items === null ? (
            <p className="empty">Loading…</p>
          ) : items.length === 0 ? (
            <p className="empty">No images yet — upload one above.</p>
          ) : (
            <div className="media-grid">
              {items.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`media-tile${selected.includes(m.id) ? " selected" : ""}`}
                  onClick={() => toggle(m.id)}
                >
                  <div className="img"><img src={`/api/media/${m.id}`} alt="" loading="lazy" /></div>
                  <div className="meta"><span>{m.filename}</span><span>{formatBytes(m.size)}</span></div>
                </button>
              ))}
            </div>
          )}
        </div>
        {multiple && (
          <div className="modal-foot">
            <button className="b" onClick={onClose}>Cancel</button>
            <button className="b b-primary" disabled={!selected.length} onClick={() => onSelect(selected)}>
              Add {selected.length || ""} image{selected.length === 1 ? "" : "s"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
