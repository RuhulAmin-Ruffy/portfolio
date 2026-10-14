"use client";

import { saveSettings } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";
import ChipsInput from "./ChipsInput";
import ImageField from "./ImageField";
import SaveBar from "./SaveBar";
import Switch from "./Switch";
import { useEditor } from "./useEditor";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const { value: s, update, state, submit } = useEditor(initial, saveSettings);

  const text = (key: keyof SiteSettings, label: string, help?: string) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input id={key} className="input" value={(s[key] as string) ?? ""} onChange={(e) => update(key, e.target.value as never)} />
      {help && <span className="help">{help}</span>}
    </div>
  );
  const area = (key: keyof SiteSettings, label: string, help?: string, tall = false) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <textarea id={key} className={`textarea${tall ? " tall" : ""}`} value={(s[key] as string) ?? ""} onChange={(e) => update(key, e.target.value as never)} />
      {help && <span className="help">{help}</span>}
    </div>
  );

  return (
    <>
      <div className="card">
        <h2>Identity</h2>
        <p className="hint">Your name and photos appear in the header, hero and about section.</p>
        <div className="grid-2">
          {text("name", "Name")}
          {text("titleLine", "Title line", "Shown under your name in the hero.")}
        </div>
        <div className="field">
          <span className="label">Logo</span>
          <ImageField contain value={s.logoId} onChange={(v) => update("logoId", v)} emptyLabel="Colour mark" />
          <span className="help">
            Replaces the four-colour square in the header, admin and browser tab. A square PNG with a transparent background works best.
          </span>
        </div>
        <div className="grid-2">
          <div className="field">
            <span className="label">Profile photo (hero)</span>
            <ImageField round value={s.profilePhotoId} onChange={(v) => update("profilePhotoId", v)} emptyLabel="Initials" />
          </div>
          <div className="field">
            <span className="label">About photo</span>
            <ImageField value={s.aboutPhotoId} onChange={(v) => update("aboutPhotoId", v)} emptyLabel="Gradient" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Hero</h2>
        <p className="hint">The first thing visitors see.</p>
        <div className="field">
          <Switch checked={s.available} onChange={(v) => update("available", v)} label="Show green “available” indicator" />
        </div>
        {text("availabilityText", "Availability line", "e.g. “Available for new projects · Dhaka, BD”")}
        <div className="grid-3">
          {text("heroPrimaryLabel", "Primary button")}
          {text("heroSecondaryLabel", "Secondary button")}
          {text("navCtaLabel", "Header button")}
        </div>
        <div className="field">
          <span className="label">Marquee keywords</span>
          <ChipsInput value={s.marquee} onChange={(v) => update("marquee", v)} placeholder="Add a keyword and press Enter" />
          <span className="help">The scrolling strip below the hero. Leave empty to hide it.</span>
        </div>
      </div>

      <div className="card">
        <h2>Section headings</h2>
        <p className="hint">Titles and intros for the Work and Illustration sections.</p>
        <div className="grid-2">
          {text("workHeading", "Work heading")}
          {text("workSubheading", "Work intro")}
          {text("illustrationHeading", "Illustration heading")}
          {text("illustrationSubheading", "Illustration intro")}
        </div>
        {text("moreProjectsLabel", "“More projects” label")}
      </div>

      <div className="card">
        <h2>About</h2>
        <p className="hint">Separate paragraphs with a blank line.</p>
        {text("aboutHeading", "Heading")}
        {area("aboutBody", "Body", undefined, true)}
        <div className="field">
          <span className="label">Skill groups</span>
          <div className="stack">
            {s.skillGroups.map((g, gi) => (
              <div className="subcard" key={gi}>
                <div className="inline" style={{ marginBottom: 10 }}>
                  <input
                    className="input grow"
                    value={g.title}
                    placeholder="Group title (e.g. Design)"
                    onChange={(e) => update("skillGroups", s.skillGroups.map((x, i) => (i === gi ? { ...x, title: e.target.value } : x)))}
                  />
                  <button type="button" className="b b-sm" disabled={gi === 0} aria-label="Move up"
                    onClick={() => { const n = [...s.skillGroups]; [n[gi - 1], n[gi]] = [n[gi], n[gi - 1]]; update("skillGroups", n); }}>↑</button>
                  <button type="button" className="b b-sm b-danger" onClick={() => update("skillGroups", s.skillGroups.filter((_, i) => i !== gi))}>Remove</button>
                </div>
                <ChipsInput
                  value={g.items}
                  placeholder="Add a skill and press Enter"
                  onChange={(items) => update("skillGroups", s.skillGroups.map((x, i) => (i === gi ? { ...x, items } : x)))}
                />
              </div>
            ))}
            <div>
              <button type="button" className="b b-sm" onClick={() => update("skillGroups", [...s.skillGroups, { title: "", items: [] }])}>
                + Add skill group
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Contact</h2>
        <p className="hint">The dark call-to-action block at the bottom of the page.</p>
        <div className="grid-2">
          {text("contactHeading", "Heading")}
          {text("email", "Email address")}
        </div>
        {area("contactBody", "Intro text")}
        <div className="field">
          <span className="label">Social links</span>
          <div className="stack">
            {s.socials.map((l, li) => (
              <div className="inline" key={li}>
                <input className="input" style={{ maxWidth: 180 }} placeholder="Label" value={l.label}
                  onChange={(e) => update("socials", s.socials.map((x, i) => (i === li ? { ...x, label: e.target.value } : x)))} />
                <input className="input grow" placeholder="https://…" value={l.url}
                  onChange={(e) => update("socials", s.socials.map((x, i) => (i === li ? { ...x, url: e.target.value } : x)))} />
                <button type="button" className="b b-sm b-danger" onClick={() => update("socials", s.socials.filter((_, i) => i !== li))}>Remove</button>
              </div>
            ))}
            <div>
              <button type="button" className="b b-sm" onClick={() => update("socials", [...s.socials, { label: "", url: "" }])}>+ Add link</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>SEO & footer</h2>
        <p className="hint">How the site appears in search results and link previews.</p>
        {text("seoTitle", "Page title")}
        {area("seoDescription", "Meta description")}
        {text("footerText", "Footer text", "Use {year} for the current year.")}
      </div>

      <SaveBar state={state} onSave={submit} />
    </>
  );
}
