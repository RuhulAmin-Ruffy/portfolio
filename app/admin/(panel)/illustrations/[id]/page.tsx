import Link from "next/link";
import { notFound } from "next/navigation";
import IllustrationForm from "@/components/admin/IllustrationForm";
import { getIllustrationById } from "@/lib/content";

export default async function EditIllustrationPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const it = Number.isInteger(id) ? await getIllustrationById(id) : null;
  if (!it) notFound();
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/illustrations" className="crumb">← Illustrations</Link>
          <h1>{it.title}</h1>
        </div>
      </div>
      <IllustrationForm
        key={it.id}
        initial={{ id: it.id, title: it.title, caption: it.caption, date: it.date, details: it.details, imageId: it.imageId, color: it.color, published: it.published }}
      />
    </>
  );
}
