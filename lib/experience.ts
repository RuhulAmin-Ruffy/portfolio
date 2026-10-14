import type { Experience } from "./types";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmt = (month: number | null, year: number) => (month ? `${MONTHS[month - 1]} ${year}` : String(year));

/** Months a role spans, counting both ends like LinkedIn (Jan–Jan = 1 mo). */
function monthsBetween(e: Pick<Experience, "startMonth" | "startYear" | "endMonth" | "endYear" | "isCurrent">, now: Date) {
  const sm = e.startMonth ?? 1;
  const [ey, em] = e.isCurrent || !e.endYear
    ? [now.getFullYear(), now.getMonth() + 1]
    : [e.endYear, e.endMonth ?? 12];
  return Math.max(1, (ey - e.startYear) * 12 + (em - sm) + 1);
}

export function formatDuration(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}

/** "Jan 2023 – Present · 1 yr 10 mos" */
export function dateRange(e: Experience, now = new Date()) {
  const end = e.isCurrent || !e.endYear ? "Present" : fmt(e.endMonth, e.endYear);
  return `${fmt(e.startMonth, e.startYear)} – ${end} · ${formatDuration(monthsBetween(e, now))}`;
}

/** Total time at a company: from its earliest start to its latest end. */
export function companyDuration(roles: Experience[], now = new Date()) {
  const key = (y: number, m: number) => y * 12 + m;
  const start = Math.min(...roles.map((r) => key(r.startYear, r.startMonth ?? 1)));
  const end = Math.max(
    ...roles.map((r) =>
      r.isCurrent || !r.endYear ? key(now.getFullYear(), now.getMonth() + 1) : key(r.endYear, r.endMonth ?? 12)
    )
  );
  return formatDuration(Math.max(1, end - start + 1));
}

export type CompanyGroup = { company: string; logoId: string | null; url: string; roles: Experience[] };

/** Consecutive roles at the same company collapse into one block, as on LinkedIn. */
export function groupByCompany(items: Experience[]): CompanyGroup[] {
  const groups: CompanyGroup[] = [];
  for (const e of items) {
    const last = groups[groups.length - 1];
    if (last && last.company.trim().toLowerCase() === e.company.trim().toLowerCase()) {
      last.roles.push(e);
      last.logoId ??= e.companyLogoId;
      last.url ||= e.companyUrl;
    } else {
      groups.push({ company: e.company, logoId: e.companyLogoId, url: e.companyUrl, roles: [e] });
    }
  }
  return groups;
}
