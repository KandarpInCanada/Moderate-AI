"use client";

import SmartCollections from "@/components/collections/smart-collections";
import Sidebar from "@/components/dashboard/sidebar";

export default function CollectionsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="collections" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Page intro */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Smart Collections
              </h2>
              <p className="text-muted-foreground mt-1">
                AI-powered photo collections automatically organized by content
              </p>
            </div>

            <SmartCollections />
          </div>
        </main>
      </div>
    </div>
  );
}
