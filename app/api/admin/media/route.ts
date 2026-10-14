import { isAdmin } from "@/lib/admin";
import { listMedia } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await listMedia());
}
