"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import GalleryGrid from "./gallery-grid";
import GalleryFilters from "./gallery-filters";

// Moderation status types
export type ModerationStatus = "approved" | "flagged" | "pending" | "all";

export default function GalleryContainer() {
  const [activeFilter, setActiveFilter] = useState<ModerationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");

  return (
    <>
      <Sidebar activeView="gallery" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Page intro */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Image Gallery
              </h2>
              <p className="text-gray-600 mt-1">
                View and manage all your uploaded images and their moderation
                status
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
