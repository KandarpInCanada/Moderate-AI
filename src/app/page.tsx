"use client";

import Dashboard from "@/components/dashboard/dashboard";
import Sidebar from "@/components/dashboard/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="dashboard" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Dashboard />
        </main>
      </div>
    </div>
  );
}
