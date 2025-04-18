"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Sidebar from "@/components/dashboard/sidebar";
import GalleryGrid from "./gallery-grid";
import GalleryFilters from "./gallery-filters";
import ImageDetailView from "./image-detail-view";
import type { ImageMetadata } from "@/types/image";

// Status types for filtering
export type ModerationStatus =
  | "approved"
  | "flagged"
  | "pending"
  | "all"
  | "text";

export default function GalleryContainer() {
  const [activeFilter, setActiveFilter] = useState<ModerationStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null
  );
  const [labelCategories, setLabelCategories] = useState<string[]>([]);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const { user, loading: authLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch images when the component mounts and user is authenticated
  useEffect(() => {
    const fetchImages = async () => {
      if (!user || !session?.access_token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/images", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch images: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Process the images to ensure they have all required fields
        const processedImages = data.images.map((img: any) => ({
          ...img,
          // Convert string dates to Date objects if needed
          lastModified: new Date(img.lastModified),
          // Set uploadDate to lastModified if not present
          uploadDate:
            img.uploadDate || new Date(img.lastModified).toISOString(),
          // Ensure these fields exist
          labels: img.labels || [],
          faces: img.faces || 0,
          location: img.location || "",
          confidence: img.confidence || 0,
          dimensions: img.dimensions || "Unknown",
          rekognitionDetails: img.rekognitionDetails || {
            labels: [],
            faces: 0,
            celebrities: [],
            text: [],
            analyzedAt: new Date().toISOString(),
          },
        }));

        setImages(processedImages);

        // Extract unique label categories
        const allLabels = new Set<string>();
        processedImages.forEach((img: ImageMetadata) => {
          if (img.labels && img.labels.length) {
            img.labels.forEach((label) => allLabels.add(label));
          }
        });

        // Sort labels alphabetically
        setLabelCategories(Array.from(allLabels).sort());
      } catch (err: any) {
        console.error("Error fetching images:", err);
        setError(err.message || "Failed to load images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [user, session]);

  // If still loading or not authenticated, show nothing
  if (authLoading || !user) {
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
                  labelCategories={labelCategories}
                  activeLabel={activeLabel}
                  onLabelChange={setActiveLabel}
                />

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-6">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Gallery Grid */}
                <GalleryGrid
                  activeFilter={activeFilter}
                  searchQuery={searchQuery}
                  sortBy={sortBy}
                  images={images}
                  loading={loading}
                  onSelectImage={setSelectedImage}
                  activeLabel={activeLabel}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
