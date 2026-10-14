import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageLightbox from "@/components/site/PageLightbox";
import ProjectVisual from "@/components/site/ProjectVisual";
import { getProjectBySlug, getProjects, mediaUrl, paragraphs } from "@/lib/content";

// Re-check the database at most once a minute, so edits saved from any server (e.g. localhost) show up live.
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    return (await getProjects()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = await getProjectBySlug((await params).slug);
  if (!project) return {};
  const image = mediaUrl(project.coverId) ?? undefined;
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, images: image ? [image] : undefined },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await getProjects();
  const idx = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;
  const meta = [
    ["Year", project.year],
    ["Client", project.client],
    ["Role", project.role],
  ].filter(([, v]) => v);
  const body = paragraphs(project.body);
  const sections = project.sections;

  return (
    <>
      <section className="project-hero">
        <div className="wrap">
          <a href="/#work" className="back-link mono">← All work</a>
          <div className="card-tags">
            {project.tags.map((t) => <span key={t} className="tag mono">{t}</span>)}
          </div>
          <h1>{project.title}</h1>
          <p className="lede">{project.summary}</p>
          {(meta.length > 0 || project.linkUrl) && (
            <dl className="project-meta">
              {meta.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
              {project.linkUrl && (
                <div>
                  <dt>Live</dt>
                  <dd><a href={project.linkUrl} target="_blank" rel="noopener noreferrer">Visit project ↗</a></dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </section>

      <div className="wrap reveal">
        <ProjectVisual className="project-cover" imageId={project.coverId} placeholder={project.placeholder} alt={`${project.title} cover`} />
      </div>

      {body.length > 0 && (
        <section className="project-body">
          <div className="wrap">
            <h2 className="reveal">Overview</h2>
            <div className="prose reveal">
              {body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </section>
      )}

      {sections.map((s, i) => {
        const text = paragraphs(s.body);
        const images = s.images.length > 0 && (
          <div className={`cs-images cs-${s.layout}`}>
            {s.images.map((id, j) => (
              <figure key={id} className="reveal">
                <img src={`/api/media/${id}`} alt={`${project.title} — ${s.heading || `section ${i + 1}`}, image ${j + 1}`} loading="lazy" data-zoom />
              </figure>
            ))}
          </div>
        );
        return (
          <section key={s.id} className={`case-section cs-layout-${s.layout}`}>
            <div className="wrap">
              <div className="cs-text reveal">
                <span className="cs-num mono">{String(i + 1).padStart(2, "0")}</span>
                {s.heading && <h2>{s.heading}</h2>}
                {text.length > 0 && <div className="prose">{text.map((p, k) => <p key={k}>{p}</p>)}</div>}
              </div>
              {images}
            </div>
          </section>
        );
      })}

      {project.gallery.length > 0 && (
        <section className="project-gallery">
          <div className="wrap">
            {sections.length > 0 && <h2 className="gallery-title reveal">More images</h2>}
            {project.gallery.map((id, i) => (
              <figure key={id} className="reveal">
                <img src={`/api/media/${id}`} alt={`${project.title} — image ${i + 1}`} loading="lazy" data-zoom />
              </figure>
            ))}
          </div>
        </section>
      )}

      <PageLightbox />

      {next && (
        <section style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="next-project">
              <a href={`/work/${next.slug}`}>
                <div className="label">Next project</div>
                <div className="name">{next.title} →</div>
              </a>
              <a href="/#contact" className="btn btn-ghost">Start a project</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
