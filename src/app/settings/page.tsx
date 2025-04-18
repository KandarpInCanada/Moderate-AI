"use client";

import SettingsContainer from "@/components/settings/settings-container";
import Sidebar from "@/components/dashboard/sidebar";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="settings" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <SettingsContainer />
        </main>
      </div>
    </div>
  );
}
