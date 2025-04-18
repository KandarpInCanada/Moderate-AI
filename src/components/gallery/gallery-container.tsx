"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import GalleryGrid from "./gallery-grid";
import GalleryFilters from "./gallery-filters";
import ImageDetailView from "./image-detail-view";
import type { ImageMetadata } from "@/types/image";
import useSWR from "swr";
import { Suspense } from "react";

// Status types for filtering
export type ModerationStatus =
  | "approved"
  | "flagged"
  | "pending"
  | "all"
  | "text";

// Add SWR fetcher function
const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
};

export default function GalleryContainer() {
  const [activeFilter, setActiveFilter] = useState<ModerationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null
  );

  const { user, loading: authLoading, session } = useAuth();
  const router = useRouter();
  const token = session?.access_token;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Use SWR for data fetching with caching and revalidation
  const { data, error, isLoading, mutate } = useSWR(
    token ? ["/api/images", token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  // Refresh data when filter changes
  useEffect(() => {
    if (token) {
      mutate();
    }
  }, [activeFilter, token, mutate]);

  // If still loading or not authenticated, show nothing
  if (authLoading || !user) {
    return null;
  }

  return (
    <>
      {selectedImage ? (
        <ImageDetailView
          image={selectedImage}
          onBack={() => setSelectedImage(null)}
        />
      ) : (
        <>
          {/* Filters */}
          <GalleryFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-6">
              <p className="text-red-700 dark:text-red-400">{error.message}</p>
              <button
                onClick={() => mutate()}
                className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Try again
              </button>
            </div>
          )}

          {/* Gallery Grid with Suspense for better loading */}
          <Suspense
            fallback={
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading your images...
                  </p>
                </div>
              </div>
            }
          >
            <GalleryGrid
              activeFilter={activeFilter}
              searchQuery={searchQuery}
              sortBy={sortBy}
              images={data?.images || []}
              loading={isLoading}
              onSelectImage={setSelectedImage}
            />
          </Suspense>
        </>
      )}
    </>
  );
}
