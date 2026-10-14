"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const NAV = [
  { href: "/admin", label: "Dashboard", d: "M3 12l9-8 9 8M5 10v10h14V10" },
  { href: "/admin/projects", label: "Projects", d: "M3 7h18v13H3zM8 7V4h8v3" },
  { href: "/admin/illustrations", label: "Illustrations", d: "M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" },
  { href: "/admin/media", label: "Media library", d: "M3 5h18v14H3zM3 15l5-4 4 3 3-2 6 4" },
  { href: "/admin/settings", label: "Site content", d: "M4 6h16M4 12h16M4 18h10" },
];

export default function Sidebar({ logoUrl }: { logoUrl: string | null }) {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  return (
    <aside className="sidebar">
      <Link href="/admin" className="brand">
        {logoUrl ? (
          <img className="brand-logo" src={logoUrl} alt="" />
        ) : (
          <span className="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        )}
        <span className="brand-name">Portfolio admin</span>
      </Link>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className={`nav-item${active(n.href) ? " active" : ""}`}>
          {icon(n.d)}
          {n.label}
        </Link>
      ))}
      <div className="spacer" />
      <a href="/" target="_blank" rel="noopener" className="nav-item">
        {icon("M14 4h6v6M20 4l-9 9M18 14v6H4V6h6")}
        View site
      </a>
      <form action={logout}>
        <button className="nav-item" type="submit">
          {icon("M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10")}
          Sign out
        </button>
      </form>
    </aside>
  );
}
