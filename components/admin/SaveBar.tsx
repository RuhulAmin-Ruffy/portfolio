"use client";

export type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved" } | { kind: "error"; message: string } | { kind: "dirty" };

export default function SaveBar({
  state,
  onSave,
  label = "Save changes",
  children,
}: {
  state: SaveState;
  onSave: () => void;
  label?: string;
  children?: React.ReactNode;
}) {
  const text =
    state.kind === "saving" ? "Saving…"
    : state.kind === "saved" ? "✓ Saved — the live site is updated"
    : state.kind === "error" ? state.message
    : state.kind === "dirty" ? "Unsaved changes"
    : "";
  const cls = state.kind === "saved" ? " ok" : state.kind === "error" ? " err" : "";
  return (
    <div className="savebar">
      <span className={`status${cls}`} role="status">{text}</span>
      {children}
      <button type="button" className="b b-primary" onClick={onSave} disabled={state.kind === "saving"}>
        {label}
      </button>
    </div>
  );
}
