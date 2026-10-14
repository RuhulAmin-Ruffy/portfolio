import Link from "next/link";
import ExperienceList from "@/components/admin/ExperienceList";
import { getExperiences } from "@/lib/content";

export default async function ExperiencePage() {
  const items = await getExperiences({ includeDrafts: true });
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Experience</h1>
          <p>Shown in the About section, newest first. The section is hidden until something is published.</p>
        </div>
        <Link href="/admin/experience/new" className="b b-primary">+ Add experience</Link>
      </div>
      <ExperienceList items={items} />
    </>
  );
}
