import MediaManager from "@/components/admin/MediaManager";
import { listMedia } from "@/lib/content";

export default async function MediaPage() {
  const items = await listMedia();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Media library</h1>
          <p>All images are stored in your Neon database and served from your own domain.</p>
        </div>
      </div>
      <MediaManager initial={items} />
    </>
  );
}
