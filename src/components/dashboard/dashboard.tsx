"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import ModerationOverview from "./moderation-overview";

export default function Dashboard() {
  const [view, setView] = useState<string>("dashboard");

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
