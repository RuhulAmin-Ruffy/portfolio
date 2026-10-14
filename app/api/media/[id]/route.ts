import { db } from "@/lib/db";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return new Response("Not found", { status: 404 });

  const rows = await db()`select mime, encode(data, 'base64') as b64 from media where id = ${id}`;
  if (!rows[0]) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(rows[0].b64 as string, "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": rows[0].mime as string,
      "Content-Length": String(bytes.length),
      // Media ids are never reused, so the bytes behind a URL never change.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
