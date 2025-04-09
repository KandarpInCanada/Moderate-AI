"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  Users,
  MapPin,
  Eye,
  Download,
  MoreHorizontal,
  Search,
} from "lucide-react";
import type { ModerationStatus } from "./gallery-container";
import ImageDetailModal from "./image-detail-modal";
import type { ImageMetadata } from "@/types/image";

interface GalleryGridProps {
  activeFilter: ModerationStatus;
  searchQuery: string;
  sortBy: "newest" | "oldest" | "name";
  images: ImageMetadata[];
  loading: boolean;
}

export default function GalleryGrid({
  activeFilter,
  searchQuery,
  sortBy,
  images,
  loading,
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(
    null
  );
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to indicate when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only filter and sort images on the client side
  const filteredImages = isClient
    ? images.filter((image) => {
        // Filter based on the selected category
        let matchesFilter = true;
        if (activeFilter === "approved") {
          // "approved" is now "People" filter
          matchesFilter = image.faces > 0;
        } else if (activeFilter === "flagged") {
          // "flagged" is now "Objects" filter
          matchesFilter = image.labels.some(
            (label) => !["People", "Person", "Human", "Face"].includes(label)
          );
        } else if (activeFilter === "pending") {
          // "pending" is now "Places" filter
          matchesFilter = image.location !== "";
        }

        // Search in filename, labels, and location
        const matchesSearch =
          image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          image.labels.some((label) =>
            label.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          (image.location &&
            image.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (image.rekognitionDetails.text &&
            image.rekognitionDetails.text.some((text) =>
              text.toLowerCase().includes(searchQuery.toLowerCase())
            ));

        return matchesFilter && matchesSearch;
      })
    : [];

  const sortedImages = isClient
    ? [...filteredImages].sort((a, b) => {
        if (sortBy === "newest") {
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        } else if (sortBy === "oldest") {
          return (
            new Date(a.lastModified).getTime() -
            new Date(b.lastModified).getTime()
          );
        } else {
          return a.filename.localeCompare(b.filename);
        }
      })
    : [];

  const toggleDropdown = (id: string) => {
    setShowDropdownId(showDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string | Date) => {
    // Use a fixed format that will be consistent between server and client
    const date = new Date(dateString);
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][date.getMonth()];
    return `${month} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getStatusIcon = (image: ImageMetadata) => {
    if (image.faces > 0) {
      return <Users className="h-4 w-4" />;
    } else if (
      image.rekognitionDetails.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return <Search className="h-4 w-4" />;
    } else {
      return <Tag className="h-4 w-4" />;
    }
  };

  const getStatusClass = (image: ImageMetadata) => {
    if (image.faces > 0) {
      return "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white border-indigo-700 dark:border-indigo-600";
    } else if (
      image.rekognitionDetails.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return "bg-green-600 text-white dark:bg-green-500 dark:text-white border-green-700 dark:border-green-600";
    } else {
      return "bg-purple-600 text-white dark:bg-purple-500 dark:text-white border-purple-700 dark:border-purple-600";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading gallery...
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading your images...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {sortedImages.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No photos found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeFilter !== "all"
              ? `No ${
                  activeFilter === "approved"
                    ? "people"
                    : activeFilter === "flagged"
                    ? "objects"
                    : "places"
                } found in your photos. Try changing your filter or uploading new images.`
              : searchQuery
              ? "No photos match your search. Try a different search term."
              : "You haven't uploaded any photos yet. Upload some photos to see them here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedImages.map((image) => (
            <div
              key={image.id}
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all"
            >
              <div className="relative aspect-square group">
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.filename}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    // If image fails to load, replace with placeholder
                    e.currentTarget.src = "/colorful-abstract-flow.png";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="bg-card rounded-full p-2 shadow-lg hover:bg-muted transition-colors"
                  >
                    <Eye className="h-5 w-5 text-foreground" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusClass(
                      image
                    )}`}
                  >
                    {getStatusIcon(image)}
                    <span className="ml-1">
                      {image.faces > 0
                        ? `${image.faces} ${
                            image.faces === 1 ? "Person" : "People"
                          }`
                        : image.rekognitionDetails.text &&
                          image.rekognitionDetails.text.length > 0
                        ? "Text"
                        : "Image"}
                    </span>
                  </span>
                </div>
                {image.location && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white border border-white/20">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{image.location}</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3
                    className="font-medium text-foreground truncate"
                    title={image.filename}
                  >
                    {image.filename}
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(image.id)}
                      className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                    {showDropdownId === image.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                        <div className="py-1">
                          <button
                            onClick={() => setSelectedImage(image)}
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </button>
                          <a
                            href={image.url}
                            download={image.filename}
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(image.lastModified)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {image.labels.length > 0 ? (
                    <>
                      {image.labels.slice(0, 3).map((label, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {label}
                        </span>
                      ))}
                      {image.labels.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          +{image.labels.length - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(image.size)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image detail modal */}
      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </>
  );
}
