import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getSettings, mediaUrl } from "@/lib/content";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const s = await getSettings().catch(() => null);
  return <LoginForm logoUrl={mediaUrl(s?.logoId)} />;
}
