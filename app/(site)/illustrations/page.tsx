import type { Metadata } from "next";
import IllustrationGrid from "@/components/site/IllustrationGrid";
import { getIllustrations, getSettings } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { title: "All illustrations", description: s.illustrationSubheading || `Illustration by ${s.name}.` };
}

export default async function AllIllustrationsPage() {
  const [s, items] = await Promise.all([getSettings(), getIllustrations()]);
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <a href="/#illustration" className="back-link mono">← Home</a>
          <h1>All illustrations</h1>
          {s.illustrationSubheading && <p className="lede">{s.illustrationSubheading}</p>}
        </div>
      </section>
      <section className="list-section">
        <div className="wrap">
          {items.length === 0 ? (
            <div className="empty-note">New pieces are on the way.</div>
          ) : (
            <IllustrationGrid items={items} variant="detailed" />
          )}
        </div>
      </section>
    </>
  );
}
