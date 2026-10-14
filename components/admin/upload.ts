import type { MediaItem } from "@/lib/types";

const MAX_EDGE = 2400;
const TARGET_BYTES = 1.5 * 1024 * 1024;

async function loadImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Downscale/re-encode large images in the browser so uploads stay small and fast. */
async function prepare(file: File): Promise<{ blob: Blob; name: string; width: number; height: number }> {
  const img = await loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;
  const tooBig = Math.max(w, h) > MAX_EDGE || file.size > TARGET_BYTES;
  if (file.type === "image/gif" || !tooBig) return { blob: file, name: file.name, width: w, height: h };

  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  canvas.getContext("2d")!.drawImage(img, 0, 0, cw, ch);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) return { blob: file, name: file.name, width: w, height: h };
  return { blob, name: file.name.replace(/\.[^.]+$/, "") + ".webp", width: cw, height: ch };
}

export async function uploadImage(file: File): Promise<MediaItem> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image`);
  const { blob, name, width, height } = await prepare(file);
  const form = new FormData();
  form.append("file", new File([blob], name, { type: blob.type || file.type }));
  form.append("width", String(width));
  form.append("height", String(height));
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data as MediaItem;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
