"use client";

import { useEffect, useRef } from "react";

type Props = {
  name: string;
  titleLine: string;
  available: boolean;
  availabilityText: string;
  photoUrl: string | null;
  primaryLabel: string;
  secondaryLabel: string;
};

function restartClass(el: HTMLElement, cls: string) {
  el.classList.remove(cls);
  void el.offsetWidth; // restart animation if triggered repeatedly
  el.classList.add(cls);
}

function fadeUp(el: HTMLElement, delay: number) {
  el.classList.remove("pre-enter");
  el.style.opacity = "0";
  el.style.transform = "translateY(20px)";
  el.style.transition = "opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1)";
  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
      el.addEventListener("transitionend", function done(e) {
        if (e.propertyName === "transform") {
          // hand control back to the stylesheet so hover/click interactions work normally
          el.style.transition = "";
          el.style.transform = "";
          el.style.opacity = "";
          el.removeEventListener("transitionend", done);
        }
      });
    }, delay);
  });
}

export default function Hero(p: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = root.current;
    if (!r) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      r.querySelectorAll<HTMLElement>(".pre-enter").forEach((el) => el.classList.remove("pre-enter"));
      return;
    }
    const q = (s: string) => Array.from(r.querySelectorAll<HTMLElement>(s));
    q(".eyebrow, .hero-photo").forEach((el) => fadeUp(el, 60));
    q(".name-letter").forEach((el, i) => fadeUp(el, 140 + i * 26));
    q(".title-word").forEach((el, i) => fadeUp(el, 420 + i * 40));
    q(".btn-row").forEach((el) => fadeUp(el, 620));
  }, []);

  const words = p.titleLine.split(" ").filter(Boolean);
  const initials = p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2);

  const keyActivate = (cls: string) => (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      restartClass(e.currentTarget, cls);
    }
  };

  return (
    <section className="hero" id="hero">
      <div className="wrap" ref={root}>
        <div className={`hero-photo pre-enter${p.photoUrl ? " has-img" : ""}`}>
          {p.photoUrl ? <img src={p.photoUrl} alt={p.name} /> : <span className="initials">{initials}</span>}
        </div>
        <div className="eyebrow mono pre-enter">
          <span className={`dot${p.available ? "" : " off"}`}></span> {p.availabilityText}
        </div>
        <h1 className="name-display" aria-label={p.name}>
          {p.name.split("").map((ch, i) =>
            ch === " " ? (
              <span key={i} className="name-space" aria-hidden="true" />
            ) : (
              <span
                key={i}
                className="name-letter pre-enter"
                aria-hidden="true"
                tabIndex={0}
                onClick={(e) => restartClass(e.currentTarget, "pop")}
                onKeyDown={keyActivate("pop")}
                onAnimationEnd={(e) => e.currentTarget.classList.remove("pop")}
              >
                {ch}
              </span>
            )
          )}
        </h1>
        <p className="title-line">
          {words.map((w, i) => (
            <span key={i}>
              <span
                className="title-word pre-enter"
                tabIndex={0}
                onClick={(e) => restartClass(e.currentTarget, "pulse")}
                onKeyDown={keyActivate("pulse")}
                onAnimationEnd={(e) => e.currentTarget.classList.remove("pulse")}
              >
                {w}
              </span>
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <div className="btn-row pre-enter">
          <a href="#work" className="btn btn-primary">{p.primaryLabel}</a>
          <a href="#contact" className="btn btn-ghost">{p.secondaryLabel}</a>
        </div>
      </div>
    </section>
  );
}
