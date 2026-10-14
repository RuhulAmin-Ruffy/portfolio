import type { Metadata } from "next";
import "./admin.css";
import { getSettings, mediaUrl } from "@/lib/content";
import { fontVars } from "@/lib/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  const icon = mediaUrl(s?.logoId) ?? "/mark.svg";
  return { title: "Admin", robots: { index: false, follow: false }, icons: { icon } };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body className="admin">{children}</body>
    </html>
  );
}
