"use client";

import { useRouter } from "next/navigation";
import { deleteIllustration, saveIllustration, type IllustrationInput } from "@/app/admin/actions";
import { ILLO_COLORS } from "@/lib/types";
import ImageField from "./ImageField";
import SaveBar from "./SaveBar";
import Switch from "./Switch";
import { useEditor } from "./useEditor";

export default function IllustrationForm({ initial }: { initial: IllustrationInput }) {
  const router = useRouter();
  const isNew = !initial.id;
  const { value: v, update, state, submit } = useEditor(initial, saveIllustration, (r) => {
    if (r.ok && isNew && r.id) router.replace(`/admin/illustrations/${r.id}`);
    else router.refresh();
  });

  const remove = async () => {
    if (!initial.id || !confirm(`Delete “${initial.title}”?`)) return;
    await deleteIllustration(initial.id);
    router.push("/admin/illustrations");
  };

  return (
    <>
      <div className="card">
        <h2>Artwork</h2>
        <p className="hint">Upload the piece. It opens full-size in a lightbox when clicked.</p>
        <div className="field">
          <span className="label">Image</span>
          <ImageField value={v.imageId} onChange={(x) => update("imageId", x)} />
        </div>
        <div className="grid-2">
          <div className="field"><label htmlFor="title">Title</label><input id="title" className="input" value={v.title} onChange={(e) => update("title", e.target.value)} /></div>
          <div className="field"><label htmlFor="caption">Caption</label><input id="caption" className="input" placeholder="e.g. Digital ink, 2025" value={v.caption} onChange={(e) => update("caption", e.target.value)} /></div>
        </div>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" className="input" style={{ maxWidth: 260 }} placeholder="e.g. March 2025" value={v.date} onChange={(e) => update("date", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="details">Details</label>
          <textarea id="details" className="textarea" placeholder="Optional — the story behind the piece, tools, client…" value={v.details} onChange={(e) => update("details", e.target.value)} />
          <span className="help">Shown on the All illustrations page and in the full-size view.</span>
        </div>
        <div className="field">
          <span className="label">Background colour</span>
          <div className="swatches" role="radiogroup" aria-label="Background colour">
            {ILLO_COLORS.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={v.color === c} aria-label={c}
                className={`swatch sw-${c}${v.color === c ? " sel" : ""}`} onClick={() => update("color", c)} />
            ))}
          </div>
          <span className="help">Shown when there is no image, and behind the image while it loads.</span>
        </div>
        <Switch checked={v.published} onChange={(x) => update("published", x)} label="Published" />
      </div>
      <SaveBar state={state} onSave={submit} label={isNew ? "Create illustration" : "Save changes"}>
        {!isNew && <button type="button" className="b b-danger" onClick={remove}>Delete</button>}
      </SaveBar>
    </>
  );
}
