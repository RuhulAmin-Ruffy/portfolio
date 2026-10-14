"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Scroll reveals, custom cursor, magnetic nav links, card tilt and keycap button presses. */
export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Document | Window, type: K | string, fn: (e: any) => void, opts?: AddEventListenerOptions) => {
      el.addEventListener(type, fn, opts);
      cleanups.push(() => el.removeEventListener(type, fn, opts));
    };

    // reveal on scroll
    const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => io.observe(el));
      cleanups.push(() => io.disconnect());
    } else {
      revealEls.forEach((el) => el.classList.add("in-view"));
    }

    // keycap buttons: guarantee a visible press-and-release even on quick taps
    on(document, "pointerdown", (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>(".btn");
      if (!btn) return;
      btn.classList.add("pressed");
      const release = () => {
        setTimeout(() => btn.classList.remove("pressed"), 120);
        btn.removeEventListener("pointerup", release);
        btn.removeEventListener("pointerleave", release);
      };
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
      document.body.classList.add("has-cursor");
      const dot = document.createElement("div");
      dot.className = "cursor-dot";
      const ring = document.createElement("div");
      ring.className = "cursor-ring";
      document.body.append(dot, ring);

      let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
      let ringX = mouseX, ringY = mouseY;
      let raf = 0;
      on(window, "mousemove", (e: MouseEvent) => {
        mouseX = e.clientX; mouseY = e.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%,-50%)`;
      });
      const animateRing = () => {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%)`;
        raf = requestAnimationFrame(animateRing);
      };
      animateRing();

      const targets = "a, button, .name-letter, .title-word, .card, .illo, .mini-card, input";
      on(document, "mouseover", (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest(targets)) ring.classList.add("active");
      });
      on(document, "mouseout", (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest(targets)) ring.classList.remove("active");
      });

      document.querySelectorAll<HTMLElement>(".nav-links a").forEach((el) => {
        on(el, "mousemove", (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.35}px, ${(e.clientY - (r.top + r.height / 2)) * 0.35}px)`;
        });
        on(el, "mouseleave", () => { el.style.transform = ""; });
      });

      document.querySelectorAll<HTMLElement>(".illo, .mini-card").forEach((el) => {
        on(el, "mousemove", (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          const tilt = el.classList.contains("illo") ? 8 : 4;
          el.style.transform = `perspective(900px) rotateX(${(-py * tilt).toFixed(2)}deg) rotateY(${(px * tilt).toFixed(2)}deg) translateY(-6px) scale(1.015)`;
        });
        on(el, "mouseleave", () => { el.style.transform = ""; });
      });

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        dot.remove();
        ring.remove();
        document.body.classList.remove("has-cursor");
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}
