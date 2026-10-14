"use client";

import { deleteIllustration, reorderIllustrations, setIllustrationPublished } from "@/app/admin/actions";
import type { Illustration } from "@/lib/types";
import SortableList from "./SortableList";

export default function IllustrationList({ items }: { items: Illustration[] }) {
  return (
    <SortableList
      editBase="/admin/illustrations"
      reorder={reorderIllustrations}
      remove={deleteIllustration}
      emptyText="No illustrations yet."
      rows={items.map((it) => ({
        id: it.id,
        title: it.title,
        sub: it.caption,
        imageId: it.imageId,
        swatch: it.color,
        badges: [
          { label: it.published ? "Live" : "Draft", on: it.published, onClass: "on-live", toggle: () => setIllustrationPublished(it.id, !it.published) },
        ],
      }))}
    />
  );
}
