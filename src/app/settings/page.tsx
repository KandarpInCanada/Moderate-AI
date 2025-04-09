import SettingsContainer from "@/components/settings/settings-container";

export const metadata = {
  title: "Settings - ModerateAI",
  description: "Manage your ModerateAI account settings",
};

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <SettingsContainer />
    </div>
  );
}
