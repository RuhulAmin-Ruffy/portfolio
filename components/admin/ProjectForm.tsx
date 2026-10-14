"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject, saveProject, type ProjectInput } from "@/app/admin/actions";
import { PLACEHOLDERS } from "@/lib/types";
import ChipsInput from "./ChipsInput";
import GalleryField from "./GalleryField";
import ImageField from "./ImageField";
import SaveBar from "./SaveBar";
import Switch from "./Switch";
import { useEditor } from "./useEditor";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

export default function ProjectForm({ initial }: { initial: ProjectInput }) {
  const router = useRouter();
  const isNew = !initial.id;
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const { value: p, update, state, submit } = useEditor(initial, saveProject, (r) => {
    if (r.ok && isNew && r.id) router.replace(`/admin/projects/${r.id}`);
    else router.refresh();
  });

  const remove = async () => {
    if (!initial.id || !confirm(`Delete “${initial.title}”? This cannot be undone.`)) return;
    await deleteProject(initial.id);
    router.push("/admin/projects");
  };

  return (
    <>
      <div className="card">
        <h2>Basics</h2>
        <p className="hint">Title, short summary and tags show on the home page cards.</p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" className="input" value={p.title} onChange={(e) => {
              update("title", e.target.value);
              if (!slugTouched) update("slug", slugify(e.target.value));
            }} />
          </div>
          <div className="field">
            <label htmlFor="slug">URL slug</label>
            <input id="slug" className="input mono" value={p.slug} onChange={(e) => { setSlugTouched(true); update("slug", e.target.value); }} />
            <span className="help">yoursite.com/work/{p.slug || "…"}</span>
          </div>
        </div>
        <div className="field">
          <label htmlFor="summary">Summary</label>
          <textarea id="summary" className="textarea" value={p.summary} onChange={(e) => update("summary", e.target.value)} />
          <span className="help">One or two sentences. The featured project shows this in full.</span>
        </div>
        <div className="field">
          <span className="label">Tags</span>
          <ChipsInput value={p.tags} onChange={(v) => update("tags", v)} placeholder="e.g. Mobile app, UI/UX" />
        </div>
      </div>

      <div className="card">
        <h2>Images</h2>
        <p className="hint">The cover is used on cards and the project page. For the featured project, the first two gallery images fill the side tiles.</p>
        <div className="field">
          <span className="label">Cover image</span>
          <ImageField value={p.coverId} onChange={(v) => update("coverId", v)} />
        </div>
        <div className="field">
          <span className="label">Gallery</span>
          <GalleryField value={p.gallery} onChange={(v) => update("gallery", v)} />
        </div>
        <div className="field">
          <label htmlFor="placeholder">Placeholder style</label>
          <select id="placeholder" className="select" style={{ maxWidth: 260 }} value={p.placeholder} onChange={(e) => update("placeholder", e.target.value)}>
            {PLACEHOLDERS.map((x) => <option key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</option>)}
          </select>
          <span className="help">Decorative artwork shown when no cover image is uploaded.</span>
        </div>
      </div>

      <div className="card">
        <h2>Case study</h2>
        <p className="hint">The full write-up on the project page. Separate paragraphs with a blank line.</p>
        <div className="field">
          <textarea className="textarea tall" aria-label="Case study" value={p.body} onChange={(e) => update("body", e.target.value)} />
        </div>
        <div className="grid-3">
          <div className="field"><label htmlFor="year">Year</label><input id="year" className="input" value={p.year} onChange={(e) => update("year", e.target.value)} /></div>
          <div className="field"><label htmlFor="client">Client</label><input id="client" className="input" value={p.client} onChange={(e) => update("client", e.target.value)} /></div>
          <div className="field"><label htmlFor="role">Role</label><input id="role" className="input" value={p.role} onChange={(e) => update("role", e.target.value)} /></div>
        </div>
        <div className="field">
          <label htmlFor="link">Live link</label>
          <input id="link" className="input" placeholder="https://…" value={p.linkUrl} onChange={(e) => update("linkUrl", e.target.value)} />
        </div>
      </div>

      <div className="card">
        <h2>Visibility</h2>
        <div className="stack">
          <Switch checked={p.published} onChange={(v) => update("published", v)} label="Published — visible on the live site" />
          <Switch checked={p.featured} onChange={(v) => update("featured", v)} label="Featured — shown large at the top of Selected work" />
        </div>
      </div>

      <SaveBar state={state} onSave={submit} label={isNew ? "Create project" : "Save changes"}>
        {!isNew && <button type="button" className="b b-danger" onClick={remove}>Delete</button>}
        {!isNew && p.published && <a className="b" href={`/work/${initial.slug}`} target="_blank" rel="noopener">View</a>}
      </SaveBar>
    </>
  );
}
