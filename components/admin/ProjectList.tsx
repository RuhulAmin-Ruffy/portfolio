"use client";

import { deleteProject, reorderProjects, setProjectFlag } from "@/app/admin/actions";
import type { Project } from "@/lib/types";
import SortableList from "./SortableList";

export default function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <SortableList
      editBase="/admin/projects"
      reorder={reorderProjects}
      remove={deleteProject}
      emptyText="No projects yet — add your first one."
      rows={projects.map((p) => ({
        id: p.id,
        title: p.title,
        sub: [p.tags.join(", "), p.year].filter(Boolean).join(" · ") || p.summary,
        imageId: p.coverId,
        badges: [
          { label: "Featured", on: p.featured, onClass: "on-featured", toggle: () => setProjectFlag(p.id, "featured", !p.featured) },
          { label: p.published ? "Live" : "Draft", on: p.published, onClass: "on-live", toggle: () => setProjectFlag(p.id, "published", !p.published) },
        ],
      }))}
    />
  );
}
