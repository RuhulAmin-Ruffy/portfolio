import Link from "next/link";
import IllustrationList from "@/components/admin/IllustrationList";
import { getIllustrations } from "@/lib/content";

export default async function IllustrationsPage() {
  const items = await getIllustrations({ includeDrafts: true });
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Illustrations</h1>
          <p>The illustration grid. The section is hidden when nothing is published.</p>
        </div>
        <Link href="/admin/illustrations/new" className="b b-primary">+ New illustration</Link>
      </div>
      <IllustrationList items={items} />
    </>
  );
}
