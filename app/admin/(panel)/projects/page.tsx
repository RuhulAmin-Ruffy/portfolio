import Link from "next/link";
import ProjectList from "@/components/admin/ProjectList";
import { getProjects } from "@/lib/content";

export default async function ProjectsPage() {
  const projects = await getProjects({ includeDrafts: true });
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <p>Use the arrows to set the order. The featured project is shown large at the top.</p>
        </div>
        <Link href="/admin/projects/new" className="b b-primary">+ New project</Link>
      </div>
      <ProjectList projects={projects} />
    </>
  );
}
