"use client";

import { useRouter } from "next/navigation";
import { deleteExperience, saveExperience, type ExperienceInput } from "@/app/admin/actions";
import { MONTHS } from "@/lib/experience";
import { EMPLOYMENT_TYPES, LOCATION_TYPES } from "@/lib/types";
import ChipsInput from "./ChipsInput";
import ImageField from "./ImageField";
import SaveBar from "./SaveBar";
import Switch from "./Switch";
import { useEditor } from "./useEditor";

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 1969 }, (_, i) => thisYear - i);

function MonthYear({
  id, month, year, onMonth, onYear, disabled,
}: {
  id: string; month: number | null; year: number | null;
  onMonth: (m: number | null) => void; onYear: (y: number | null) => void; disabled?: boolean;
}) {
  return (
    <div className="inline">
      <select id={id} className="select" aria-label="Month" value={month ?? ""} disabled={disabled}
        onChange={(e) => onMonth(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select className="select" aria-label="Year" value={year ?? ""} disabled={disabled}
        onChange={(e) => onYear(e.target.value ? Number(e.target.value) : null)}>
        <option value="">Year</option>
        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  );
}

export default function ExperienceForm({ initial }: { initial: ExperienceInput }) {
  const router = useRouter();
  const isNew = !initial.id;
  const { value: v, update, state, submit } = useEditor(initial, saveExperience, (r) => {
    if (r.ok && isNew && r.id) router.replace(`/admin/experience/${r.id}`);
    else router.refresh();
  });

  const remove = async () => {
    if (!initial.id || !confirm(`Delete “${initial.role} at ${initial.company}”?`)) return;
    await deleteExperience(initial.id);
    router.push("/admin/experience");
  };

  return (
    <>
      <div className="card">
        <h2>Role</h2>
        <p className="hint">Roles at the same company are grouped together on your site, like on LinkedIn.</p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="role">Title</label>
            <input id="role" className="input" placeholder="e.g. Senior Product Designer" value={v.role} onChange={(e) => update("role", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="type">Employment type</label>
            <select id="type" className="select" value={v.employmentType} onChange={(e) => update("employmentType", e.target.value)}>
              <option value="">Please select</option>
              {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="company">Company or organisation</label>
            <input id="company" className="input" placeholder="e.g. Flowly Inc." value={v.company} onChange={(e) => update("company", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="url">Company website</label>
            <input id="url" className="input" placeholder="https://…" value={v.companyUrl} onChange={(e) => update("companyUrl", e.target.value)} />
          </div>
        </div>
        <div className="field">
          <span className="label">Company logo</span>
          <ImageField contain value={v.companyLogoId} onChange={(x) => update("companyLogoId", x)} emptyLabel="Initial" />
          <span className="help">Without a logo, the company’s first letter is shown.</span>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" className="input" placeholder="e.g. Dhaka, Bangladesh" value={v.location} onChange={(e) => update("location", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="ltype">Location type</label>
            <select id="ltype" className="select" value={v.locationType} onChange={(e) => update("locationType", e.target.value)}>
              <option value="">Please select</option>
              {LOCATION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Dates</h2>
        <p className="hint">The duration (e.g. “1 yr 4 mos”) is worked out automatically.</p>
        <div className="field">
          <Switch checked={v.isCurrent} onChange={(x) => update("isCurrent", x)} label="I currently work in this role" />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="start">Start date</label>
            <MonthYear id="start" month={v.startMonth} year={v.startYear}
              onMonth={(m) => update("startMonth", m)} onYear={(y) => update("startYear", y)} />
          </div>
          <div className="field">
            <label htmlFor="end">End date</label>
            {v.isCurrent ? (
              <div className="input" style={{ color: "var(--mute)" }}>Present</div>
            ) : (
              <MonthYear id="end" month={v.endMonth} year={v.endYear}
                onMonth={(m) => update("endMonth", m)} onYear={(y) => update("endYear", y)} />
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Details</h2>
        <div className="field">
          <label htmlFor="desc">Description</label>
          <textarea id="desc" className="textarea" placeholder="What you did and what changed because of it. Separate paragraphs with a blank line."
            value={v.description} onChange={(e) => update("description", e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Skills</span>
          <ChipsInput value={v.skills} onChange={(x) => update("skills", x)} placeholder="e.g. Figma, Design systems" />
        </div>
        <Switch checked={v.published} onChange={(x) => update("published", x)} label="Published" />
      </div>

      <SaveBar state={state} onSave={submit} label={isNew ? "Add experience" : "Save changes"}>
        {!isNew && <button type="button" className="b b-danger" onClick={remove}>Delete</button>}
      </SaveBar>
    </>
  );
}
