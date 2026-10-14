import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

export async function isAdmin() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Guard for server actions and admin pages — never rely on the proxy alone. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
