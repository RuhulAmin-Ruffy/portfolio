"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <div className="login-wrap">
      <form className="login" action={action}>
        <span className="brand-mark" aria-hidden="true" style={{ width: 32, height: 32, display: "grid" }}>
          <span></span><span></span><span></span><span></span>
        </span>
        <h1>Welcome back</h1>
        <p>Sign in to manage your portfolio.</p>
        {state?.error && <div className="err" role="alert">{state.error}</div>}
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required autoFocus />
        </div>
        <button className="b b-primary" style={{ width: "100%", marginTop: 8 }} disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
