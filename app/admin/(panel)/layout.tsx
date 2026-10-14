import Sidebar from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/admin";
import { getSettings, mediaUrl } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const s = await getSettings();
  return (
    <div className="shell">
      <Sidebar logoUrl={mediaUrl(s.logoId)} />
      <div className="main">{children}</div>
    </div>
  );
}
