"use client";

import type { ProjectSection, SectionLayout } from "@/lib/types";
import GalleryField from "./GalleryField";

const LAYOUTS: { value: SectionLayout; label: string; help: string }[] = [
  { value: "grid", label: "Grid", help: "Images in two columns" },
  { value: "full", label: "Full width", help: "Images stacked, edge to edge" },
  { value: "side", label: "Text beside images", help: "Text on the left, images on the right" },
];

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());

/** Break a case study into topics — each with its own heading, text and images. */
export default function SectionsEditor({
  value,
  onChange,
}: {
  value: ProjectSection[];
  onChange: (v: ProjectSection[]) => void;
}) {
  const patch = (i: number, p: Partial<ProjectSection>) => onChange(value.map((s, j) => (j === i ? { ...s, ...p } : s)));
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const add = () => onChange([...value, { id: newId(), heading: "", body: "", images: [], layout: "grid" }]);

  return (
    <div className="stack">
      {value.length === 0 && (
        <p className="help" style={{ marginBottom: 4 }}>
          No sections yet. Add one per topic — e.g. “The problem”, “Research”, “Onboarding”, “Final design”.
        </p>
      )}
      {value.map((s, i) => (
        <div className="subcard section-card" key={s.id}>
          <div className="section-head">
            <span className="section-num mono">{String(i + 1).padStart(2, "0")}</span>
            <input
              className="input grow"
              placeholder="Section heading (e.g. Onboarding)"
              value={s.heading}
              onChange={(e) => patch(i, { heading: e.target.value })}
              aria-label={`Section ${i + 1} heading`}
            />
            <button type="button" className="b b-sm b-icon" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" className="b b-sm b-icon" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button
              type="button"
              className="b b-sm b-danger"
              onClick={() => {
                if ((s.heading || s.body || s.images.length) && !confirm(`Remove section “${s.heading || i + 1}”?`)) return;
                onChange(value.filter((_, j) => j !== i));
              }}
            >
              Remove
            </button>
          </div>
          <div className="field">
            <textarea
              className="textarea"
              placeholder="What happened in this part of the project? Separate paragraphs with a blank line."
              value={s.body}
              onChange={(e) => patch(i, { body: e.target.value })}
              aria-label={`Section ${i + 1} text`}
            />
          </div>
          <div className="field">
            <span className="label">Images</span>
            <GalleryField value={s.images} onChange={(images) => patch(i, { images })} />
          </div>
          <div className="field">
            <span className="label">Layout</span>
            <div className="seg" role="radiogroup" aria-label={`Section ${i + 1} layout`}>
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  role="radio"
                  aria-checked={s.layout === l.value}
                  className={s.layout === l.value ? "on" : ""}
                  title={l.help}
                  onClick={() => patch(i, { layout: l.value })}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="b" onClick={add}>+ Add section</button>
      </div>
    </div>
  );
}
