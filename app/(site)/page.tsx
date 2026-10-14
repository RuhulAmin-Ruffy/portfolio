import Hero from "@/components/site/Hero";
import IllustrationGrid from "@/components/site/IllustrationGrid";
import ProjectVisual from "@/components/site/ProjectVisual";
import { getIllustrations, getProjects, getSettings, mediaUrl, paragraphs, splitFeatured } from "@/lib/content";

// Re-check the database at most once a minute, so edits saved from any server (e.g. localhost) show up live.
export const revalidate = 60;

const MORE_PROJECTS_ON_HOME = 3; // one row
const ILLUSTRATIONS_ON_HOME = 6; // two rows

export default async function Home() {
  const [s, projects, illustrations] = await Promise.all([getSettings(), getProjects(), getIllustrations()]);
  const { featured, others } = splitFeatured(projects);
  const aboutPhoto = mediaUrl(s.aboutPhotoId);
  const marquee = s.marquee.length ? [...s.marquee, ...s.marquee] : [];

  return (
    <>
      <Hero
        name={s.name}
        titleLine={s.titleLine}
        available={s.available}
        availabilityText={s.availabilityText}
        photoUrl={mediaUrl(s.profilePhotoId)}
        primaryLabel={s.heroPrimaryLabel}
        secondaryLabel={s.heroSecondaryLabel}
      />

      {marquee.length > 0 && (
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track mono">
            {marquee.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        </div>
      )}

      <section id="work">
        <div className="wrap">
          <div className="sec-head reveal">
            <h2>{s.workHeading}</h2>
            {s.workSubheading && <p>{s.workSubheading}</p>}
          </div>

          {!featured && <div className="empty-note">New work is on the way.</div>}

          {featured && (
            <div className="featured-project reveal">
              <div className="featured-gallery">
                <ProjectVisual className="featured-img main" imageId={featured.coverId} placeholder={featured.placeholder} alt={`${featured.title} — main image`} />
                <ProjectVisual className="featured-img small" imageId={featured.gallery[0] ?? null} placeholder={featured.gallery[0] || featured.coverId ? "plain" : "bazaarly"} variant="small" alt={`${featured.title} — detail`} />
                <ProjectVisual className="featured-img small" imageId={featured.gallery[1] ?? null} placeholder={featured.gallery[1] || featured.coverId ? "plain" : "transit"} variant="small" alt={`${featured.title} — detail`} />
              </div>
              <div className="featured-info">
                <div className="card-tags">
                  {featured.tags.map((t) => <span key={t} className="tag mono">{t}</span>)}
                </div>
                <h3>{featured.title}</h3>
                <p>{featured.summary}</p>
                <a href={`/work/${featured.slug}`} className="btn btn-primary">View project</a>
              </div>
            </div>
          )}

          {others.length > 0 && (
            <>
              <div className="other-projects-head reveal">
                <h4 className="mono">{s.moreProjectsLabel}</h4>
              </div>
              <div className="other-projects-grid">
                {others.slice(0, MORE_PROJECTS_ON_HOME).map((p) => (
                  <a key={p.id} href={`/work/${p.slug}`} className="mini-card reveal">
                    <ProjectVisual className="card-visual" imageId={p.coverId} placeholder={p.placeholder} alt={`${p.title} cover`} />
                    <div className="card-tags">
                      {p.tags.map((t) => <span key={t} className="tag mono">{t}</span>)}
                    </div>
                    <h4>{p.title}<span className="arrow" aria-hidden="true">→</span></h4>
                    <p>{p.summary}</p>
                  </a>
                ))}
              </div>
              <div className="view-all-row reveal">
                <a href="/work" className="view-all mono">View all projects <span aria-hidden="true">→</span></a>
              </div>
            </>
          )}
        </div>
      </section>

      {illustrations.length > 0 && (
        <section id="illustration">
          <div className="wrap">
            <div className="sec-head reveal">
              <h2>{s.illustrationHeading}</h2>
              {s.illustrationSubheading && <p>{s.illustrationSubheading}</p>}
            </div>
            <IllustrationGrid items={illustrations.slice(0, ILLUSTRATIONS_ON_HOME)} />
            {illustrations.length > ILLUSTRATIONS_ON_HOME && (
              <div className="view-all-row reveal">
                <a href="/illustrations" className="view-all mono">
                  View all illustrations <span aria-hidden="true">→</span>
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="about" id="about">
        <div className="wrap">
          <div className={`about-photo reveal${aboutPhoto ? " has-img" : ""}`}>
            {aboutPhoto ? (
              <img src={aboutPhoto} alt={s.name} loading="lazy" />
            ) : (
              <div className="monogram" aria-hidden="true">
                {s.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2)}
              </div>
            )}
          </div>
          <div className="reveal">
            <h2>{s.aboutHeading}</h2>
            {paragraphs(s.aboutBody).map((para, i) => <p key={i}>{para}</p>)}
            {s.skillGroups.map((g) => (
              <div className="skill-group" key={g.title}>
                <h4>{g.title}</h4>
                <div className="pills">
                  {g.items.map((item) => <span key={item} className="pill">{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="contact reveal">
          <h2>{s.contactHeading}</h2>
          {s.contactBody && <p>{s.contactBody}</p>}
          {s.email && <a href={`mailto:${s.email}`} className="btn btn-primary">{s.email}</a>}
          {s.socials.length > 0 && (
            <div className="social-row mono">
              {s.socials.map((l) => (
                <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
