import { db } from "./db";
import type { Experience, Illustration, MediaItem, Project, SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  name: "Your Name",
  seoTitle: "Portfolio",
  seoDescription: "",
  available: true,
  availabilityText: "Available for new projects",
  titleLine: "",
  heroPrimaryLabel: "View work",
  heroSecondaryLabel: "Get in touch",
  navCtaLabel: "Say hello",
  logoId: null,
  profilePhotoId: null,
  aboutPhotoId: null,
  marquee: [],
  workHeading: "Selected work",
  workSubheading: "",
  moreProjectsLabel: "More projects",
  illustrationHeading: "Illustration",
  illustrationSubheading: "",
  aboutHeading: "About",
  aboutBody: "",
  experienceHeading: "Experience",
  skillGroups: [],
  contactHeading: "Let's build something.",
  contactBody: "",
  email: "",
  socials: [],
  footerText: "© {year}",
};

export function mediaUrl(id: string | null | undefined) {
  return id ? `/api/media/${id}` : null;
}

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db()`select data from settings where id = 1`;
  return { ...DEFAULT_SETTINGS, ...((rows[0]?.data as Partial<SiteSettings>) ?? {}) };
}

type Row = Record<string, any>;

function toProject(r: Row): Project {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    body: r.body,
    tags: r.tags ?? [],
    coverId: r.cover_id,
    gallery: r.gallery ?? [],
    sections: r.sections ?? [],
    placeholder: r.placeholder,
    featured: r.featured,
    published: r.published,
    year: r.year,
    client: r.client,
    role: r.role,
    linkUrl: r.link_url,
    sortOrder: r.sort_order,
  };
}

function toIllustration(r: Row): Illustration {
  return {
    id: r.id,
    title: r.title,
    caption: r.caption,
    date: r.date ?? "",
    details: r.details ?? "",
    imageId: r.image_id,
    color: r.color,
    published: r.published,
    sortOrder: r.sort_order,
  };
}

export async function getProjects(opts: { includeDrafts?: boolean } = {}) {
  const rows = opts.includeDrafts
    ? await db()`select * from projects order by sort_order, id`
    : await db()`select * from projects where published order by sort_order, id`;
  return rows.map(toProject);
}

export async function getProjectBySlug(slug: string) {
  const rows = await db()`select * from projects where slug = ${slug} and published limit 1`;
  return rows[0] ? toProject(rows[0]) : null;
}

export async function getProjectById(id: number) {
  const rows = await db()`select * from projects where id = ${id} limit 1`;
  return rows[0] ? toProject(rows[0]) : null;
}

export async function getIllustrations(opts: { includeDrafts?: boolean } = {}) {
  const rows = opts.includeDrafts
    ? await db()`select * from illustrations order by sort_order, id`
    : await db()`select * from illustrations where published order by sort_order, id`;
  return rows.map(toIllustration);
}

export async function getIllustrationById(id: number) {
  const rows = await db()`select * from illustrations where id = ${id} limit 1`;
  return rows[0] ? toIllustration(rows[0]) : null;
}

function toExperience(r: Row): Experience {
  return {
    id: r.id,
    role: r.role,
    company: r.company,
    companyLogoId: r.company_logo_id,
    companyUrl: r.company_url,
    employmentType: r.employment_type,
    location: r.location,
    locationType: r.location_type,
    startMonth: r.start_month,
    startYear: r.start_year,
    endMonth: r.end_month,
    endYear: r.end_year,
    isCurrent: r.is_current,
    description: r.description,
    skills: r.skills ?? [],
    published: r.published,
  };
}

/** Newest first, like LinkedIn: by start date, current roles winning ties. */
export async function getExperiences(opts: { includeDrafts?: boolean } = {}) {
  const rows = opts.includeDrafts
    ? await db()`select * from experiences
        order by start_year desc, coalesce(start_month, 0) desc, is_current desc, id desc`
    : await db()`select * from experiences where published
        order by start_year desc, coalesce(start_month, 0) desc, is_current desc, id desc`;
  return rows.map(toExperience);
}

export async function getExperienceById(id: number) {
  const rows = await db()`select * from experiences where id = ${id} limit 1`;
  return rows[0] ? toExperience(rows[0]) : null;
}

export async function listMedia(): Promise<MediaItem[]> {
  const rows = await db()`
    select id, filename, mime, size, width, height, created_at
    from media order by created_at desc`;
  return rows.map((r) => ({
    id: r.id,
    filename: r.filename,
    mime: r.mime,
    size: r.size,
    width: r.width,
    height: r.height,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}

/** Featured project = first project flagged featured, else the first project. */
export function splitFeatured(projects: Project[]) {
  const featured = projects.find((p) => p.featured) ?? projects[0] ?? null;
  return { featured, others: projects.filter((p) => p !== featured) };
}

export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
