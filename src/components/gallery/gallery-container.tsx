"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Sidebar from "@/components/dashboard/sidebar";
import GalleryGrid from "./gallery-grid";
import GalleryFilters from "./gallery-filters";

// Status types for filtering
export type ModerationStatus = "approved" | "flagged" | "pending" | "all";

export default function GalleryContainer() {
  const [activeFilter, setActiveFilter] = useState<ModerationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

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
    <>
      <Sidebar activeView="gallery" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Page intro */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Photo Gallery
              </h2>
              <p className="text-muted-foreground mt-1">
                Browse and search your photos with AI-powered labels from AWS
                Rekognition
              </p>
            </div>

            {/* Filters */}
            <GalleryFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            {/* Gallery Grid */}
            <GalleryGrid
              activeFilter={activeFilter}
              searchQuery={searchQuery}
              sortBy={sortBy}
            />
          </div>
        </main>
      </div>
    </>
  );
}
