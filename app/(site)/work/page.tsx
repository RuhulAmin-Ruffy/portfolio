import type { Metadata } from "next";
import ProjectVisual from "@/components/site/ProjectVisual";
import { getProjects, getSettings } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: "All projects", description: `Product design and visual work by ${s.name}.` };
}

export default async function AllProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <a href="/#work" className="back-link mono">← Home</a>
          <h1>All projects</h1>
          <p className="lede">
            {projects.length} project{projects.length === 1 ? "" : "s"} — case studies, products and visual work.
          </p>
        </div>
      </section>

      <section className="list-section">
        <div className="wrap">
          {projects.length === 0 && <div className="empty-note">New work is on the way.</div>}
          {projects.map((p) => {
            const meta = [["Year", p.year], ["Client", p.client], ["Role", p.role]].filter(([, v]) => v);
            return (
              <article key={p.id} className="proj-row reveal">
                <a href={`/work/${p.slug}`} className="proj-row-visual" aria-label={`Open ${p.title}`} tabIndex={-1}>
                  <ProjectVisual className="card-visual" imageId={p.coverId} placeholder={p.placeholder} alt={`${p.title} cover`} />
                </a>
                <div className="proj-row-info">
                  {p.tags.length > 0 && (
                    <div className="card-tags">
                      {p.tags.map((t) => <span key={t} className="tag mono">{t}</span>)}
                    </div>
                  )}
                  <h2><a href={`/work/${p.slug}`}>{p.title}</a></h2>
                  {p.summary && <p className="summary">{p.summary}</p>}
                  {meta.length > 0 && (
                    <dl className="proj-row-meta">
                      {meta.map(([k, v]) => (
                        <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                      ))}
                    </dl>
                  )}
                  <a href={`/work/${p.slug}`} className="view-all mono">View project <span aria-hidden="true">→</span></a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
