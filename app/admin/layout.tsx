import type { Metadata } from "next";
import "./admin.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body className="admin">{children}</body>
    </html>
  );
}
