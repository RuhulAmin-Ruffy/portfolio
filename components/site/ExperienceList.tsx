import { mediaUrl, paragraphs } from "@/lib/content";
import { companyDuration, dateRange, groupByCompany } from "@/lib/experience";
import type { Experience } from "@/lib/types";
import SeeMore from "./SeeMore";

const SWATCHES = ["var(--violet)", "var(--coral)", "var(--mint)", "var(--yellow)", "#2c2b31"];
const swatch = (name: string) => SWATCHES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % SWATCHES.length];

function Logo({ company, logoId }: { company: string; logoId: string | null }) {
  const src = mediaUrl(logoId);
  return src ? (
    <img className="xp-logo" src={src} alt={`${company} logo`} loading="lazy" />
  ) : (
    <div className="xp-logo xp-logo-fallback" style={{ background: swatch(company) }} aria-hidden="true">
      {company.trim()[0]?.toUpperCase()}
    </div>
  );
}

function CompanyName({ name, url }: { name: string; url: string }) {
  return url ? <a href={url} target="_blank" rel="noopener noreferrer">{name}</a> : <>{name}</>;
}

function Extra({ e }: { e: Experience }) {
  const text = paragraphs(e.description);
  return (
    <>
      {text.length > 0 && <SeeMore paragraphs={text} />}
      {e.skills.length > 0 && (
        <p className="xp-skills">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l7 7-7 7-7-7z" fill="currentColor" /></svg>
          <span><strong>Skills:</strong> {e.skills.join(" · ")}</span>
        </p>
      )}
    </>
  );
}

const join = (...parts: string[]) => parts.filter(Boolean).join(" · ");

export default function ExperienceList({ items, heading }: { items: Experience[]; heading: string }) {
  const groups = groupByCompany(items);
  return (
    <div className="xp">
      <h3 className="about-label">{heading}</h3>
      <ol className="xp-list">
        {groups.map((g) => {
          if (g.roles.length === 1) {
            const e = g.roles[0];
            return (
              <li key={e.id} className="xp-item">
                <Logo company={g.company} logoId={g.logoId} />
                <div className="xp-body">
                  <h4>{e.role}</h4>
                  <p className="xp-line"><CompanyName name={g.company} url={g.url} />{e.employmentType && ` · ${e.employmentType}`}</p>
                  <p className="xp-muted">{dateRange(e)}</p>
                  {(e.location || e.locationType) && <p className="xp-muted">{join(e.location, e.locationType)}</p>}
                  <Extra e={e} />
                </div>
              </li>
            );
          }
          const types = [...new Set(g.roles.map((r) => r.employmentType).filter(Boolean))];
          const locations = [...new Set(g.roles.map((r) => join(r.location, r.locationType)).filter(Boolean))];
          return (
            <li key={`g-${g.roles[0].id}`} className="xp-item">
              <Logo company={g.company} logoId={g.logoId} />
              <div className="xp-body">
                <h4><CompanyName name={g.company} url={g.url} /></h4>
                <p className="xp-line">{join(types.length === 1 ? types[0] : "", companyDuration(g.roles))}</p>
                {locations.length === 1 && <p className="xp-muted">{locations[0]}</p>}
                <ol className="xp-roles">
                  {g.roles.map((e) => (
                    <li key={e.id} className="xp-role">
                      <h4>{e.role}</h4>
                      {types.length > 1 && e.employmentType && <p className="xp-line">{e.employmentType}</p>}
                      <p className="xp-muted">{dateRange(e)}</p>
                      {locations.length > 1 && (e.location || e.locationType) && (
                        <p className="xp-muted">{join(e.location, e.locationType)}</p>
                      )}
                      <Extra e={e} />
                    </li>
                  ))}
                </ol>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
