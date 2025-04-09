"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Sidebar from "./sidebar";
import ModerationOverview from "./moderation-overview";

export default function Dashboard() {
  const [view, setView] = useState<string>("dashboard");

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
    <div className="flex h-screen bg-background">
      <Sidebar activeView={view} onNavigate={setView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <ModerationOverview />
        </main>
      </div>
    </div>
  );
}
