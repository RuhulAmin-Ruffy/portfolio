import Link from "next/link";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/projects" className="crumb">← Projects</Link>
          <h1>New project</h1>
        </div>
      </div>
      <ProjectForm
        initial={{
          title: "", slug: "", summary: "", body: "", tags: [], coverId: null, gallery: [],
          placeholder: "plain", featured: false, published: true, year: String(new Date().getFullYear()),
          client: "", role: "", linkUrl: "",
        }}
      />
    </>
  );
}
