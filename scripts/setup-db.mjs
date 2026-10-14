// Creates the schema and seeds it with starter content (only when tables are empty).
// Run with: npm run db:setup
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (expected in .env.local)");
  process.exit(1);
}
const sql = neon(url);

await sql`create extension if not exists pgcrypto`;

await sql`
  create table if not exists media (
    id uuid primary key default gen_random_uuid(),
    filename text not null,
    mime text not null,
    size integer not null,
    width integer,
    height integer,
    data bytea not null,
    created_at timestamptz not null default now()
  )`;

await sql`
  create table if not exists settings (
    id integer primary key default 1 check (id = 1),
    data jsonb not null,
    updated_at timestamptz not null default now()
  )`;

await sql`
  create table if not exists projects (
    id serial primary key,
    slug text not null unique,
    title text not null,
    summary text not null default '',
    body text not null default '',
    tags text[] not null default '{}',
    cover_id uuid references media(id) on delete set null,
    gallery uuid[] not null default '{}',
    placeholder text not null default 'plain',
    featured boolean not null default false,
    published boolean not null default true,
    year text not null default '',
    client text not null default '',
    role text not null default '',
    link_url text not null default '',
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  )`;

await sql`
  create table if not exists illustrations (
    id serial primary key,
    title text not null,
    caption text not null default '',
    image_id uuid references media(id) on delete set null,
    color text not null default 'violet',
    published boolean not null default true,
    sort_order integer not null default 0,
    created_at timestamptz not null default now()
  )`;

await sql`create index if not exists projects_order_idx on projects (sort_order, id)`;
await sql`create index if not exists illustrations_order_idx on illustrations (sort_order, id)`;

// ---------- seed ----------
const [{ count: settingsCount }] = await sql`select count(*)::int as count from settings`;
if (settingsCount === 0) {
  const data = {
    name: "Ruhul Amin",
    seoTitle: "Ruhul Amin — Digital Experience Designer",
    seoDescription:
      "Digital experience designer, illustrator and artist based in Dhaka. Product design, design systems and editorial illustration.",
    available: true,
    availabilityText: "Available for new projects · Dhaka, BD",
    titleLine: "Digital Experience Designer. Illustrator and Artist.",
    heroPrimaryLabel: "View work",
    heroSecondaryLabel: "Get in touch",
    navCtaLabel: "Say hello",
    profilePhotoId: null,
    aboutPhotoId: null,
    marquee: ["UI / UX Design", "Illustration", "Design Systems", "Prototyping", "Editorial Art", "Visual Storytelling"],
    workHeading: "Selected work",
    workSubheading: "One project, up close — plus a look at a few others.",
    moreProjectsLabel: "More projects",
    illustrationHeading: "Illustration",
    illustrationSubheading: "Personal and editorial pieces — ink, colour, and shapes that don't need a grid.",
    aboutHeading: "Two disciplines, one way of thinking.",
    aboutBody:
      "I'm Ruhul, a digital experience designer and visual storyteller based in Dhaka. My design work leans systematic — grids, states, and flows that hold up under real use. My illustration work leans expressive — the part of the brief a component library can't hold.\n\nI've spent the last few years moving between the two, using research and structure to guide the UI work, and drawing to keep the instinct for shape, rhythm and colour sharp.",
    skillGroups: [
      { title: "Design", items: ["Figma", "Design systems", "Prototyping", "User research", "Information architecture"] },
      { title: "Illustration", items: ["Procreate", "Adobe Illustrator", "Character design", "Editorial art"] },
    ],
    contactHeading: "Let's build something.",
    contactBody: "Open to product design roles, illustration commissions, and everything in between.",
    email: "hello@ruhulamin.design",
    socials: [
      { label: "Behance", url: "https://www.behance.net/" },
      { label: "Instagram", url: "https://www.instagram.com/" },
      { label: "LinkedIn", url: "https://www.linkedin.com/" },
    ],
    footerText: "© {year} Ruhul Amin. Built with care in Dhaka.",
  };
  await sql`insert into settings (id, data) values (1, ${JSON.stringify(data)}::jsonb)`;
  console.log("Seeded settings");
}

const [{ count: projectCount }] = await sql`select count(*)::int as count from projects`;
if (projectCount === 0) {
  const projects = [
    {
      slug: "flowly",
      title: "Flowly",
      summary:
        "A habit-tracking app redesigned around one-thumb use. I rebuilt the onboarding flow, simplified the daily check-in to a single tap, and introduced a lighter visual system — cutting first-week drop-off and making the app feel like something people wanted to open, not a chore.",
      body:
        "Flowly had a loyal core of users and a leaky first week. Interviews and session recordings pointed at the same thing: the app asked for too much, too early, and the daily check-in took four taps on a good day.\n\nI rebuilt onboarding around a single goal, moved every primary action into the bottom third of the screen, and collapsed the check-in into one tap with an optional detail sheet.\n\nThe new visual system swapped heavy cards for a lighter, colour-coded rhythm that made streaks feel rewarding rather than punishing.",
      tags: ["Mobile app", "UI/UX"],
      placeholder: "flowly",
      featured: true,
      year: "2025",
      client: "Flowly Inc.",
      role: "Lead product designer",
    },
    {
      slug: "bazaarly",
      title: "Bazaarly",
      summary: "A grocery marketplace redesign focused on faster browsing and a clearer checkout.",
      body:
        "Bazaarly's catalogue had grown faster than its navigation. I restructured categories around how people actually shop — by meal and by aisle — and redesigned the checkout into three clear steps.",
      tags: ["Web app"],
      placeholder: "bazaarly",
      year: "2024",
      role: "Product designer",
    },
    {
      slug: "transit",
      title: "Transit",
      summary: "An operations dashboard built around a live map and a data-dense design system.",
      body:
        "Dispatchers needed to see a whole city's fleet at a glance and act in seconds. The dashboard centres on a live map, with a compact, data-dense component library built to stay readable on a wall display.",
      tags: ["Dashboard"],
      placeholder: "transit",
      year: "2024",
      role: "UX & design systems",
    },
    {
      slug: "nur",
      title: "Nur",
      summary: "An editorial illustration series exploring light and quiet domestic moments.",
      body:
        "Nur — Bangla for light — is a personal series about the small, quiet moments of home: morning sun across a floor, a lamp left on, steam from a cup of tea.",
      tags: ["Editorial"],
      placeholder: "nur",
      year: "2023",
      role: "Illustrator",
    },
  ];
  let i = 0;
  for (const p of projects) {
    await sql`
      insert into projects (slug, title, summary, body, tags, placeholder, featured, year, client, role, sort_order)
      values (${p.slug}, ${p.title}, ${p.summary}, ${p.body}, ${p.tags}, ${p.placeholder},
              ${p.featured ?? false}, ${p.year ?? ""}, ${p.client ?? ""}, ${p.role ?? ""}, ${i++})`;
  }
  console.log(`Seeded ${projects.length} projects`);
}

const [{ count: illoCount }] = await sql`select count(*)::int as count from illustrations`;
if (illoCount === 0) {
  const illos = [
    ["Morning Light", "Digital ink, 2025", "violet"],
    ["Paper Cranes", "Editorial, 2025", "coral"],
    ["City Hum", "Personal, 2024", "ink"],
    ["Monsoon Notes", "Digital ink, 2024", "mint"],
    ["Tea Break", "Personal, 2024", "yellow"],
    ["Night Market", "Editorial, 2023", "lavender"],
  ];
  let i = 0;
  for (const [title, caption, color] of illos) {
    await sql`insert into illustrations (title, caption, color, sort_order) values (${title}, ${caption}, ${color}, ${i++})`;
  }
  console.log(`Seeded ${illos.length} illustrations`);
}

console.log("Database ready.");
