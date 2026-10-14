import Link from "next/link";
import { getIllustrations, getProjects, getSettings, listMedia } from "@/lib/content";

export default async function Dashboard() {
  const [s, projects, illos, media] = await Promise.all([
    getSettings(),
    getProjects({ includeDrafts: true }),
    getIllustrations({ includeDrafts: true }),
    listMedia(),
  ]);
  const drafts = projects.filter((p) => !p.published).length;
  const featured = projects.find((p) => p.featured);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hi, {s.name.split(" ")[0]} 👋</h1>
          <p>Everything on your portfolio is editable from here. Changes go live as soon as you save.</p>
        </div>
        <Link href="/admin/projects/new" className="b b-primary">+ New project</Link>
      </div>
      <div className="stats">
        <Link href="/admin/projects" className="stat">
          <span className="n">{projects.length}</span>
          <span className="l">Projects{drafts ? ` · ${drafts} draft${drafts > 1 ? "s" : ""}` : ""}</span>
        </Link>
        <Link href="/admin/illustrations" className="stat">
          <span className="n">{illos.length}</span>
          <span className="l">Illustrations</span>
        </Link>
        <Link href="/admin/media" className="stat">
          <span className="n">{media.length}</span>
          <span className="l">Images in library</span>
        </Link>
        <Link href={featured ? `/admin/projects/${featured.id}` : "/admin/projects"} className="stat">
          <span className="n" style={{ fontSize: 20, lineHeight: "38px" }}>{featured?.title ?? "—"}</span>
          <span className="l">Featured project</span>
        </Link>
      </div>
      <div className="quick">
        <Link href="/admin/projects/new"><h3>Add recent work</h3><p>Upload a cover, gallery and case study for a new project.</p></Link>
        <Link href="/admin/illustrations/new"><h3>Post an illustration</h3><p>Add a piece to the illustration grid.</p></Link>
        <Link href="/admin/settings"><h3>Edit site content</h3><p>Hero, about, skills, contact details, socials and SEO.</p></Link>
        <Link href="/admin/media"><h3>Media library</h3><p>Bulk-upload and manage every image on the site.</p></Link>
      </div>
    </>
  );
}
