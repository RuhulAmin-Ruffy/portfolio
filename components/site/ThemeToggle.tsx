"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";
const KEY = "theme";

function apply(theme: Theme, animate: boolean) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add("theme-fade");
    window.setTimeout(() => root.classList.remove("theme-fade"), 400);
  }
  root.dataset.theme = theme;
}

/** Sun/moon switch in the nav. Which icon shows is decided by CSS from <html data-theme>, so it never flickers. */
export default function ThemeToggle() {
  // Until the visitor picks a theme, keep following the device setting live.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let stored: string | null = null;
      try { stored = localStorage.getItem(KEY); } catch {}
      if (stored !== "light" && stored !== "dark") apply(mq.matches ? "dark" : "light", true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply(next, true);
    try { localStorage.setItem(KEY, next); } catch {}
  };

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode" title="Toggle dark mode">
      <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
      </svg>
      <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}

/** Runs in <head> before first paint: stored choice, else the device setting. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`;
