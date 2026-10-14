import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectForm from "@/components/admin/ProjectForm";
import { getProjectById } from "@/lib/content";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await getProjectById(id) : null;
  if (!p) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/projects" className="crumb">← Projects</Link>
          <h1>{p.title}</h1>
        </div>
      </div>
      <ProjectForm
        key={p.id}
        initial={{
          id: p.id, title: p.title, slug: p.slug, summary: p.summary, body: p.body, tags: p.tags,
          coverId: p.coverId, gallery: p.gallery, placeholder: p.placeholder, featured: p.featured,
          published: p.published, year: p.year, client: p.client, role: p.role, linkUrl: p.linkUrl,
        }}
      />
    </>
  );
}
