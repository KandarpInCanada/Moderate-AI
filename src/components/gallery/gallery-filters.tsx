"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { ModerationStatus } from "./gallery-container";

interface GalleryFiltersProps {
  activeFilter: ModerationStatus;
  onFilterChange: (filter: ModerationStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "newest" | "oldest" | "name";
  onSortChange: (sort: "newest" | "oldest" | "name") => void;
}

export default function GalleryFilters({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: GalleryFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "all"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("approved")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "approved"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => onFilterChange("flagged")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "flagged"
                ? "bg-white text-red-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Flagged
          </button>
          <button
            onClick={() => onFilterChange("pending")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "pending"
                ? "bg-white text-yellow-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            Pending
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center">
          <SlidersHorizontal className="h-5 w-5 text-gray-400 mr-2" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "newest" | "oldest" | "name")
            }
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
