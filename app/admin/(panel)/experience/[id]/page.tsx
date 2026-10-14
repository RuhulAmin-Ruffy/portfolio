import Link from "next/link";
import { notFound } from "next/navigation";
import ExperienceForm from "@/components/admin/ExperienceForm";
import { getExperienceById } from "@/lib/content";

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const e = Number.isInteger(id) ? await getExperienceById(id) : null;
  if (!e) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/experience" className="crumb">← Experience</Link>
          <h1>{e.role}</h1>
          <p>{e.company}</p>
        </div>
      </div>
      <ExperienceForm key={e.id} initial={{ ...e }} />
    </>
  );
}
