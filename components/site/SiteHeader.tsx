"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { name: string; ctaLabel: string; showIllustration: boolean };

export default function SiteHeader({ name, ctaLabel, showIllustration }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/#work", label: "Work" },
    ...(showIllustration ? [{ href: "/#illustration", label: "Illustration" }] : []),
    { href: "/#about", label: "About" },
  ];

  return (
    <header className="site-header">
      <div className={`floating-nav${scrolled ? " scrolled" : ""}`}>
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-mark" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </span>
          {name}
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="nav-actions">
          <a href="/#contact" className="btn btn-primary nav-cta">{ctaLabel}</a>
          <button
            className="burger"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <nav id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`} aria-label="Mobile">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <a href="/#contact" onClick={() => setOpen(false)}>{ctaLabel}</a>
      </nav>
    </header>
  );
}
