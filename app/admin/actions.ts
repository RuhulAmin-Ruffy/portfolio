"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/content";
import { db } from "@/lib/db";
import { EMPLOYMENT_TYPES, ILLO_COLORS, LOCATION_TYPES, PLACEHOLDERS, SECTION_LAYOUTS, type ProjectSection, type SiteSettings } from "@/lib/types";

type Result = { ok: true; id?: number } | { ok: false; error: string };

function refreshSite() {
  revalidatePath("/", "layout");
}

const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const uuidOrNull = (v: unknown) =>
  typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : null;

// ---------- auth ----------

export async function login(_prev: { error?: string } | undefined, form: FormData) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  const given = String(form.get("password") ?? "");
  const hash = (s: string) => createHash("sha256").update(s).digest();
  // Small fixed delay blunts brute force; hashing first makes the compare constant-time.
  await new Promise((r) => setTimeout(r, 400));
  if (!expected || !timingSafeEqual(hash(given), hash(expected))) {
    return { error: "Incorrect password" };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- settings ----------

export async function saveSettings(input: SiteSettings): Promise<Result> {
  await requireAdmin();
  const clean: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    const v = input[key];
    const def = DEFAULT_SETTINGS[key];
    if (typeof def === "string") (clean as any)[key] = str(v);
    else if (typeof def === "boolean") (clean as any)[key] = Boolean(v);
  }
  if (!clean.name) return { ok: false, error: "Name is required" };
  clean.logoId = uuidOrNull(input.logoId);
  clean.profilePhotoId = uuidOrNull(input.profilePhotoId);
  clean.aboutPhotoId = uuidOrNull(input.aboutPhotoId);
  clean.marquee = (input.marquee ?? []).map((m) => str(m, 80)).filter(Boolean);
  clean.skillGroups = (input.skillGroups ?? [])
    .map((g) => ({ title: str(g.title, 80), items: (g.items ?? []).map((i) => str(i, 80)).filter(Boolean) }))
    .filter((g) => g.title);
  clean.socials = (input.socials ?? [])
    .map((s) => ({ label: str(s.label, 40), url: str(s.url, 500) }))
    .filter((s) => s.label && s.url);

  await db()`
    insert into settings (id, data, updated_at) values (1, ${JSON.stringify(clean)}::jsonb, now())
    on conflict (id) do update set data = excluded.data, updated_at = now()`;
  refreshSite();
  return { ok: true };
}

// ---------- projects ----------

export type ProjectInput = {
  id?: number;
  title: string;
  slug: string;
  summary: string;
  body: string;
  tags: string[];
  coverId: string | null;
  gallery: string[];
  sections: ProjectSection[];
  placeholder: string;
  featured: boolean;
  published: boolean;
  year: string;
  client: string;
  role: string;
  linkUrl: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanSections(input: unknown): ProjectSection[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, 30)
    .map((raw, i) => {
      const s = (raw ?? {}) as Partial<ProjectSection>;
      return {
        id: str(s.id, 64) || `s${i}`,
        heading: str(s.heading, 160),
        body: str(s.body, 10000),
        images: (Array.isArray(s.images) ? s.images : []).map(uuidOrNull).filter((x): x is string => !!x).slice(0, 30),
        layout: (SECTION_LAYOUTS as readonly string[]).includes(s.layout as string) ? (s.layout as ProjectSection["layout"]) : "grid",
      };
    })
    .filter((s) => s.heading || s.body || s.images.length);
}

export async function saveProject(input: ProjectInput): Promise<Result> {
  await requireAdmin();
  const title = str(input.title, 160);
  if (!title) return { ok: false, error: "Title is required" };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Slug is invalid" };
  const link = str(input.linkUrl, 500);
  if (link && !/^https?:\/\//i.test(link)) return { ok: false, error: "Live link must start with http:// or https://" };

  const p = {
    title,
    slug,
    summary: str(input.summary, 1000),
    body: str(input.body, 20000),
    tags: (input.tags ?? []).map((t) => str(t, 40)).filter(Boolean).slice(0, 6),
    coverId: uuidOrNull(input.coverId),
    gallery: (input.gallery ?? []).map(uuidOrNull).filter((x): x is string => !!x).slice(0, 24),
    sections: JSON.stringify(cleanSections(input.sections)),
    placeholder: (PLACEHOLDERS as readonly string[]).includes(input.placeholder) ? input.placeholder : "plain",
    featured: Boolean(input.featured),
    published: Boolean(input.published),
    year: str(input.year, 20),
    client: str(input.client, 120),
    role: str(input.role, 120),
    link,
  };

  const clash = await db()`select id from projects where slug = ${slug} and id <> ${input.id ?? 0}`;
  if (clash.length) return { ok: false, error: `Another project already uses the URL slug "${slug}"` };

  let id = input.id;
  if (id) {
    await db()`
      update projects set title=${p.title}, slug=${p.slug}, summary=${p.summary}, body=${p.body},
        tags=${p.tags}, cover_id=${p.coverId}, gallery=${p.gallery}::uuid[], sections=${p.sections}::jsonb,
        placeholder=${p.placeholder},
        featured=${p.featured}, published=${p.published}, year=${p.year}, client=${p.client},
        role=${p.role}, link_url=${p.link}, updated_at=now()
      where id=${id}`;
  } else {
    const rows = await db()`
      insert into projects (title, slug, summary, body, tags, cover_id, gallery, sections, placeholder, featured,
        published, year, client, role, link_url, sort_order)
      values (${p.title}, ${p.slug}, ${p.summary}, ${p.body}, ${p.tags}, ${p.coverId}, ${p.gallery}::uuid[],
        ${p.sections}::jsonb, ${p.placeholder}, ${p.featured}, ${p.published}, ${p.year}, ${p.client}, ${p.role}, ${p.link},
        (select coalesce(min(sort_order), 0) - 1 from projects))
      returning id`;
    id = rows[0].id as number;
  }
  if (p.featured) await db()`update projects set featured = false where id <> ${id}`;
  refreshSite();
  return { ok: true, id };
}

export async function deleteProject(id: number): Promise<Result> {
  await requireAdmin();
  await db()`delete from projects where id = ${id}`;
  refreshSite();
  return { ok: true };
}

export async function setProjectFlag(id: number, flag: "featured" | "published", value: boolean): Promise<Result> {
  await requireAdmin();
  if (flag === "featured") {
    if (value) await db()`update projects set featured = (id = ${id})`;
    else await db()`update projects set featured = false where id = ${id}`;
  } else {
    await db()`update projects set published = ${value} where id = ${id}`;
  }
  refreshSite();
  return { ok: true };
}

export async function reorderProjects(ids: number[]): Promise<Result> {
  await requireAdmin();
  const clean = ids.map(Number).filter(Number.isInteger);
  await db()`
    update projects set sort_order = x.ord
    from unnest(${clean}::int[]) with ordinality as x(id, ord)
    where projects.id = x.id`;
  refreshSite();
  return { ok: true };
}

// ---------- illustrations ----------

export type IllustrationInput = {
  id?: number;
  title: string;
  caption: string;
  date: string;
  details: string;
  imageId: string | null;
  color: string;
  published: boolean;
};

export async function saveIllustration(input: IllustrationInput): Promise<Result> {
  await requireAdmin();
  const title = str(input.title, 120);
  if (!title) return { ok: false, error: "Title is required" };
  const caption = str(input.caption, 160);
  const date = str(input.date, 60);
  const details = str(input.details, 5000);
  const imageId = uuidOrNull(input.imageId);
  const color = (ILLO_COLORS as readonly string[]).includes(input.color) ? input.color : "violet";
  const published = Boolean(input.published);

  let id = input.id;
  if (id) {
    await db()`update illustrations set title=${title}, caption=${caption}, date=${date}, details=${details}, image_id=${imageId},
      color=${color}, published=${published} where id=${id}`;
  } else {
    const rows = await db()`
      insert into illustrations (title, caption, date, details, image_id, color, published, sort_order)
      values (${title}, ${caption}, ${date}, ${details}, ${imageId}, ${color}, ${published},
        (select coalesce(min(sort_order), 0) - 1 from illustrations))
      returning id`;
    id = rows[0].id as number;
  }
  refreshSite();
  return { ok: true, id };
}

export async function deleteIllustration(id: number): Promise<Result> {
  await requireAdmin();
  await db()`delete from illustrations where id = ${id}`;
  refreshSite();
  return { ok: true };
}

export async function setIllustrationPublished(id: number, value: boolean): Promise<Result> {
  await requireAdmin();
  await db()`update illustrations set published = ${value} where id = ${id}`;
  refreshSite();
  return { ok: true };
}

export async function reorderIllustrations(ids: number[]): Promise<Result> {
  await requireAdmin();
  const clean = ids.map(Number).filter(Number.isInteger);
  await db()`
    update illustrations set sort_order = x.ord
    from unnest(${clean}::int[]) with ordinality as x(id, ord)
    where illustrations.id = x.id`;
  refreshSite();
  return { ok: true };
}

// ---------- experience ----------

export type ExperienceInput = {
  id?: number;
  role: string;
  company: string;
  companyLogoId: string | null;
  companyUrl: string;
  employmentType: string;
  location: string;
  locationType: string;
  startMonth: number | null;
  startYear: number | null;
  endMonth: number | null;
  endYear: number | null;
  isCurrent: boolean;
  description: string;
  skills: string[];
  published: boolean;
};

export async function saveExperience(input: ExperienceInput): Promise<Result> {
  await requireAdmin();
  const role = str(input.role, 160);
  const company = str(input.company, 160);
  if (!role) return { ok: false, error: "Title is required" };
  if (!company) return { ok: false, error: "Company is required" };

  const month = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 12 ? (v as number) : null);
  const year = (v: unknown) => (Number.isInteger(v) && (v as number) >= 1950 && (v as number) <= 2100 ? (v as number) : null);
  const startMonth = month(input.startMonth);
  const startYear = year(input.startYear);
  if (!startYear) return { ok: false, error: "Start year is required" };
  const isCurrent = Boolean(input.isCurrent);
  const endMonth = isCurrent ? null : month(input.endMonth);
  const endYear = isCurrent ? null : year(input.endYear);
  if (!isCurrent && !endYear) return { ok: false, error: "Add an end year, or tick “I currently work here”" };
  if (endYear && endYear * 12 + (endMonth ?? 12) < startYear * 12 + (startMonth ?? 1)) {
    return { ok: false, error: "End date can't be before the start date" };
  }
  const url = str(input.companyUrl, 500);
  if (url && !/^https?:\/\//i.test(url)) return { ok: false, error: "Company link must start with http:// or https://" };

  const e = {
    role,
    company,
    logo: uuidOrNull(input.companyLogoId),
    url,
    type: (EMPLOYMENT_TYPES as readonly string[]).includes(input.employmentType) ? input.employmentType : "",
    location: str(input.location, 160),
    locationType: (LOCATION_TYPES as readonly string[]).includes(input.locationType) ? input.locationType : "",
    description: str(input.description, 5000),
    skills: (input.skills ?? []).map((x) => str(x, 60)).filter(Boolean).slice(0, 20),
    published: Boolean(input.published),
  };

  let id = input.id;
  if (id) {
    await db()`
      update experiences set role=${e.role}, company=${e.company}, company_logo_id=${e.logo}, company_url=${e.url},
        employment_type=${e.type}, location=${e.location}, location_type=${e.locationType},
        start_month=${startMonth}, start_year=${startYear}, end_month=${endMonth}, end_year=${endYear},
        is_current=${isCurrent}, description=${e.description}, skills=${e.skills}, published=${e.published},
        updated_at=now()
      where id=${id}`;
  } else {
    const rows = await db()`
      insert into experiences (role, company, company_logo_id, company_url, employment_type, location, location_type,
        start_month, start_year, end_month, end_year, is_current, description, skills, published)
      values (${e.role}, ${e.company}, ${e.logo}, ${e.url}, ${e.type}, ${e.location}, ${e.locationType},
        ${startMonth}, ${startYear}, ${endMonth}, ${endYear}, ${isCurrent}, ${e.description}, ${e.skills}, ${e.published})
      returning id`;
    id = rows[0].id as number;
  }
  refreshSite();
  return { ok: true, id };
}

export async function deleteExperience(id: number): Promise<Result> {
  await requireAdmin();
  await db()`delete from experiences where id = ${id}`;
  refreshSite();
  return { ok: true };
}

export async function setExperiencePublished(id: number, value: boolean): Promise<Result> {
  await requireAdmin();
  await db()`update experiences set published = ${value} where id = ${id}`;
  refreshSite();
  return { ok: true };
}

// ---------- media ----------

export async function deleteMedia(id: string): Promise<Result> {
  await requireAdmin();
  const mid = uuidOrNull(id);
  if (!mid) return { ok: false, error: "Invalid id" };
  // cover_id / image_id are cleared by the FK; arrays and settings need a manual sweep.
  await db()`update projects set gallery = array_remove(gallery, ${mid}::uuid) where ${mid}::uuid = any(gallery)`;
  await db()`
    update projects set sections = (
      select coalesce(jsonb_agg(
        jsonb_set(s, '{images}', coalesce((
          select jsonb_agg(img) from jsonb_array_elements(s->'images') img where img #>> '{}' <> ${mid}
        ), '[]'::jsonb))
      order by ord), '[]'::jsonb)
      from jsonb_array_elements(sections) with ordinality as t(s, ord)
    )
    where sections @> ${JSON.stringify([{ images: [mid] }])}::jsonb`;
  await db()`
    update settings set data = data
      || case when data->>'profilePhotoId' = ${mid} then '{"profilePhotoId": null}'::jsonb else '{}'::jsonb end
      || case when data->>'aboutPhotoId' = ${mid} then '{"aboutPhotoId": null}'::jsonb else '{}'::jsonb end
      || case when data->>'logoId' = ${mid} then '{"logoId": null}'::jsonb else '{}'::jsonb end
    where id = 1`;
  await db()`delete from media where id = ${mid}`;
  refreshSite();
  return { ok: true };
}
