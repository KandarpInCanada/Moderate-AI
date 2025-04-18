"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import SettingsGeneral from "./settings-general";
import SettingsAppearance from "./settings-appearance";
import NotificationSettings from "./notification-settings";

type SettingsTab = "general" | "appearance" | "notifications";

export default function SettingsContainer() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your PhotoSense account settings and preferences
        </p>
      </div>

      {/* Settings navigation */}
      <div className="bg-card rounded-xl shadow-sm border border-border mb-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          <nav className="flex p-2 space-x-2 w-full">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "general"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "appearance"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "notifications"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>
      </div>

      {/* Settings content */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        {activeTab === "general" && <SettingsGeneral />}
        {activeTab === "appearance" && <SettingsAppearance />}
        {activeTab === "notifications" && <NotificationSettings />}
      </div>
    </div>
  );
}
