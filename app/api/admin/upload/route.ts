import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX_BYTES = 4 * 1024 * 1024; // stays under typical serverless body limits (~4.5MB)

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: "Only JPEG, PNG, WebP, GIF or AVIF images are allowed" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "Image is larger than 4 MB after compression" }, { status: 413 });
  }

  const int = (v: FormDataEntryValue | null | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };
  const hex = Buffer.from(await file.arrayBuffer()).toString("hex");
  const filename = (file.name || "image").slice(0, 200);

  const rows = await db()`
    insert into media (filename, mime, size, width, height, data)
    values (${filename}, ${file.type}, ${file.size}, ${int(form?.get("width"))}, ${int(form?.get("height"))}, decode(${hex}, 'hex'))
    returning id, filename, mime, size, width, height, created_at`;
  const r = rows[0];
  return Response.json({
    id: r.id,
    filename: r.filename,
    mime: r.mime,
    size: r.size,
    width: r.width,
    height: r.height,
    createdAt: new Date(r.created_at).toISOString(),
  });
}
