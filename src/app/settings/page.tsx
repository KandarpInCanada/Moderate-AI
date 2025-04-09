import SettingsContainer from "@/components/settings/settings-container";

export const metadata = {
  title: "Settings - PhotoSense",
  description: "Manage your PhotoSense account settings",
};

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <SettingsContainer />
    </div>
  );
}
