"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SaveState } from "./SaveBar";

type Result = { ok: true; id?: number } | { ok: false; error: string };

/** Form state + save lifecycle: dirty tracking, Cmd/Ctrl+S, and an unsaved-changes guard. */
export function useEditor<T>(initial: T, save: (v: T) => Promise<Result>, onSaved?: (r: Result) => void) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const latest = useRef(value);
  latest.current = value;

  const update = useCallback(<K extends keyof T>(key: K, v: T[K]) => {
    setValue((prev) => ({ ...prev, [key]: v }));
    setState({ kind: "dirty" });
  }, []);

  const submit = useCallback(async () => {
    setState({ kind: "saving" });
    try {
      const r = await save(latest.current);
      if (r.ok) {
        setState({ kind: "saved" });
        onSaved?.(r);
      } else setState({ kind: "error", message: r.error });
    } catch {
      setState({ kind: "error", message: "Something went wrong — please try again" });
    }
  }, [save, onSaved]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        submit();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (state.kind === "dirty") e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [submit, state.kind]);

  return { value, update, state, submit };
}
