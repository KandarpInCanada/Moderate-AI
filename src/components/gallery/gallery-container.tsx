"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import GalleryGrid from "./gallery-grid";
import type { ImageMetadata } from "@/types/image";
import useSWR from "swr";
import { Suspense } from "react";
import ImageDetailView from "./image-detail-view";

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

interface GalleryContainerProps {
  activeCollection?: string | null;
}

export default function GalleryContainer({
  activeCollection,
}: GalleryContainerProps) {
  // We'll keep these states but they won't be controlled by the removed filter component
  const [activeFilter, setActiveFilter] = useState<ModerationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredImages, setFilteredImages] = useState<ImageMetadata[]>([]);

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

  // Filter images based on active collection
  useEffect(() => {
    if (!data?.images) {
      setFilteredImages([]);
      return;
    }

    if (!activeCollection) {
      // No collection filter, show all images
      setFilteredImages(data.images);
      return;
    }

    // Filter based on collection type
    let filtered: ImageMetadata[] = [];

    if (activeCollection === "people") {
      // People collection
      filtered = data.images.filter(
        (img: ImageMetadata) => img.faces && img.faces > 0
      );
    } else if (activeCollection.startsWith("location-")) {
      // Location collection
      const locationName = activeCollection
        .replace("location-", "")
        .replace(/-/g, " ");
      filtered = data.images.filter(
        (img: ImageMetadata) =>
          img.location && img.location.toLowerCase() === locationName
      );
    } else if (activeCollection.startsWith("label-")) {
      // Label collection
      const labelName = activeCollection
        .replace("label-", "")
        .replace(/-/g, " ");
      filtered = data.images.filter(
        (img: ImageMetadata) =>
          img.labels &&
          img.labels.some((label: string) => label.toLowerCase() === labelName)
      );
    } else if (activeCollection.startsWith("date-")) {
      // Date collection
      const dateName = activeCollection.replace("date-", "").replace(/-/g, " ");
      filtered = data.images.filter((img: ImageMetadata) => {
        try {
          const date = new Date(img.lastModified);
          const monthYear = `${date
            .toLocaleString("default", { month: "long" })
            .toLowerCase()} ${date.getFullYear()}`;
          return monthYear.toLowerCase() === dateName.toLowerCase();
        } catch (e) {
          return false;
        }
      });
    }

    setFilteredImages(filtered);
  }, [data, activeCollection]);

  // Refresh data when filter changes
  useEffect(() => {
    if (token) {
      mutate();
    }
  }, [activeFilter, token, mutate]);

  // Handle image selection and modal
  const handleSelectImage = (image: ImageMetadata) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: Add a small delay before clearing the selected image
    // This allows the exit animation to complete
    setTimeout(() => {
      setSelectedImage(null);
    }, 300);
  };

  // If still loading or not authenticated, show nothing
  if (authLoading || !user) {
    return null;
  }

  return (
    <>
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
              <p className="text-muted-foreground">Loading your images...</p>
            </div>
          </div>
        }
      >
        <GalleryGrid
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          sortBy={sortBy}
          images={
            filteredImages.length > 0 ? filteredImages : data?.images || []
          }
          loading={isLoading}
          onSelectImage={handleSelectImage}
        />
      </Suspense>

      {/* Image Detail Modal */}
      {selectedImage && (
        <ImageDetailView
          image={selectedImage}
          onClose={handleCloseModal}
          isOpen={isModalOpen}
        />
      )}
    </>
  );
}
