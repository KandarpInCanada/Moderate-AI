"use client";

import { Suspense } from "react";
import Dashboard from "@/components/dashboard/dashboard";
import Sidebar from "@/components/dashboard/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="dashboard" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <Suspense
            fallback={
              <div className="max-w-7xl mx-auto animate-fade-in">
                <div className="h-8 w-64 bg-muted rounded animate-pulse mb-4"></div>
                <div className="h-4 w-96 bg-muted rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`skeleton-stat-${i}`}
                      className="bg-card rounded-xl shadow-sm border border-border p-6"
                    >
                      <div className="h-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <Dashboard />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
