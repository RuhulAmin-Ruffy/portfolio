export type SkillGroup = { title: string; items: string[] };
export type SocialLink = { label: string; url: string };

export type SiteSettings = {
  name: string;
  seoTitle: string;
  seoDescription: string;
  available: boolean;
  availabilityText: string;
  titleLine: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  navCtaLabel: string;
  profilePhotoId: string | null;
  aboutPhotoId: string | null;
  marquee: string[];
  workHeading: string;
  workSubheading: string;
  moreProjectsLabel: string;
  illustrationHeading: string;
  illustrationSubheading: string;
  aboutHeading: string;
  aboutBody: string;
  skillGroups: SkillGroup[];
  contactHeading: string;
  contactBody: string;
  email: string;
  socials: SocialLink[];
  footerText: string;
};

export const PLACEHOLDERS = ["plain", "flowly", "bazaarly", "transit", "nur"] as const;
export type Placeholder = (typeof PLACEHOLDERS)[number];

export const SECTION_LAYOUTS = ["grid", "full", "side"] as const;
export type SectionLayout = (typeof SECTION_LAYOUTS)[number];

/** One topic of a case study: its own heading, text and images. */
export type ProjectSection = {
  id: string;
  heading: string;
  body: string;
  images: string[];
  layout: SectionLayout;
};

export type Project = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  coverId: string | null;
  gallery: string[];
  sections: ProjectSection[];
  placeholder: Placeholder;
  featured: boolean;
  published: boolean;
  year: string;
  client: string;
  role: string;
  linkUrl: string;
  sortOrder: number;
};

export const ILLO_COLORS = ["violet", "coral", "ink", "mint", "yellow", "lavender"] as const;
export type IlloColor = (typeof ILLO_COLORS)[number];

export type Illustration = {
  id: number;
  title: string;
  caption: string;
  date: string;
  details: string;
  imageId: string | null;
  color: IlloColor;
  published: boolean;
  sortOrder: number;
};

export type MediaItem = {
  id: string;
  filename: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  createdAt: string;
};
