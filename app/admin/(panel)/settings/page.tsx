import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/content";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Site content</h1>
          <p>Edit every piece of text and photo on the home page. Press ⌘S / Ctrl+S to save.</p>
        </div>
      </div>
      <SettingsForm initial={settings} />
    </>
  );
}
