"use client";

import { useState } from "react";
import GalleryContainer from "@/components/gallery/gallery-container";
import AdvancedSearch from "@/components/search/advanced-search";
import Sidebar from "@/components/dashboard/sidebar";

export default function GalleryPage() {
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="gallery" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Page intro */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Photo Gallery
                </h2>
                <p className="text-muted-foreground mt-1">
                  Browse and search your photos with AI-powered labels from AWS
                  Rekognition
                </p>
              </div>

              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAdvancedSearch
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {showAdvancedSearch ? "Simple View" : "Advanced Search"}
              </button>
            </div>

            {showAdvancedSearch ? <AdvancedSearch /> : <GalleryContainer />}
          </div>
        </main>
      </div>
    </div>
  );
}
