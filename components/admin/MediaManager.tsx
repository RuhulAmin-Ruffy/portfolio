"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteMedia } from "@/app/admin/actions";
import type { MediaItem } from "@/lib/types";
import { formatBytes, uploadImage } from "./upload";

export default function MediaManager({ initial }: { initial: MediaItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 1800); };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setProgress(`Uploading ${i + 1} of ${list.length}…`);
      try {
        const m = await uploadImage(list[i]);
        setItems((s) => [m, ...s]);
      } catch (e) {
        setError((e as Error).message);
      }
    }
    setProgress("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  };

  const remove = async (m: MediaItem) => {
    if (!confirm(`Delete ${m.filename}? It will be removed anywhere it's used on the site.`)) return;
    setItems((s) => s.filter((x) => x.id !== m.id));
    await deleteMedia(m.id);
    router.refresh();
  };

  return (
    <>
      <div
        className="dropzone"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("over"); }}
        onDragLeave={(e) => e.currentTarget.classList.remove("over")}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("over"); upload(e.dataTransfer.files); }}
      >
        {progress || <><strong>Click to upload</strong> or drag images here · JPEG, PNG, WebP, GIF, AVIF · large photos are resized automatically</>}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {error && <p className="status err" style={{ marginBottom: 16 }}>{error}</p>}
      {items.length === 0 ? (
        <div className="rows"><p className="empty">Your library is empty.</p></div>
      ) : (
        <div className="media-grid">
          {items.map((m) => (
            <div className="media-tile" key={m.id}>
              <div className="img"><img src={`/api/media/${m.id}`} alt={m.filename} loading="lazy" /></div>
              <div className="meta">
                <span title={m.filename}>{m.filename}</span>
                <span>{formatBytes(m.size)}</span>
              </div>
              <div className="meta" style={{ paddingTop: 0 }}>
                <span>{m.width && m.height ? `${m.width}×${m.height}` : ""}</span>
                <span style={{ display: "flex", gap: 4 }}>
                  <button className="b b-sm" onClick={() => { navigator.clipboard.writeText(`${location.origin}/api/media/${m.id}`); flash("Link copied"); }}>Copy</button>
                  <button className="b b-sm b-danger" onClick={() => remove(m)}>Delete</button>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
