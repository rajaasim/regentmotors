import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/data/site-settings-repository";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <main>
      <p className="eyebrow">Site management</p>
      <h1 className="mt-3 font-display text-4xl text-white">Settings</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Update business details, public page copy, consent wording and search metadata.
      </p>
      <SettingsForm settings={settings} />
    </main>
  );
}
