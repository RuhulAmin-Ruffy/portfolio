"use client";

import { deleteExperience, setExperiencePublished } from "@/app/admin/actions";
import { dateRange } from "@/lib/experience";
import type { Experience } from "@/lib/types";
import SortableList from "./SortableList";

export default function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <SortableList
      editBase="/admin/experience"
      remove={deleteExperience}
      emptyText="No experience yet — add your first role."
      rows={items.map((e) => ({
        id: e.id,
        title: `${e.role} · ${e.company}`,
        sub: dateRange(e),
        imageId: e.companyLogoId,
        badges: [
          { label: e.published ? "Live" : "Draft", on: e.published, onClass: "on-live", toggle: () => setExperiencePublished(e.id, !e.published) },
        ],
      }))}
    />
  );
}
