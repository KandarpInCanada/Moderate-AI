"use client";

import {
  Search,
  Tag,
  Users,
  MapPin,
  Text,
  ImageIcon,
  Filter,
} from "lucide-react";
import type { ModerationStatus } from "./gallery-container";
import { motion } from "framer-motion";

interface GalleryFiltersProps {
  activeFilter: ModerationStatus;
  onFilterChange: (filter: ModerationStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "newest" | "oldest" | "name";
  onSortChange: (sort: "newest" | "oldest" | "name") => void;
  // Make label-related props optional
  labelCategories?: string[];
  activeLabel?: string | null;
  onLabelChange?: (label: string | null) => void;
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6 transition-all hover:shadow-md"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
            placeholder="Search photos by content, labels, or text..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === "all"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1 inline-block" />
            All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange("approved")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center ${
              activeFilter === "approved"
                ? "bg-card text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Users className="h-3.5 w-3.5 mr-1" />
            People
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange("flagged")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center ${
              activeFilter === "flagged"
                ? "bg-card text-purple-600 dark:text-purple-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Tag className="h-3.5 w-3.5 mr-1" />
            Objects
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange("pending")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center ${
              activeFilter === "pending"
                ? "bg-card text-green-600 dark:text-green-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <MapPin className="h-3.5 w-3.5 mr-1" />
            Places
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange("text")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center ${
              activeFilter === "text"
                ? "bg-card text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <Text className="h-3.5 w-3.5 mr-1" />
            Text
          </motion.button>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-muted-foreground mr-2" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "newest" | "oldest" | "name")
            }
            className="block w-full pl-3 pr-10 py-2 text-base border border-input focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground rounded-md"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
