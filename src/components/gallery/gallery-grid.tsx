"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Users,
  MapPin,
  Eye,
  Download,
  MoreHorizontal,
  Text,
  ImageIcon,
} from "lucide-react";
import type { ModerationStatus } from "./gallery-container";
import type { ImageMetadata } from "@/types/image";
import { refreshImageUrl } from "@/lib/s3-client";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryGridProps {
  activeFilter: ModerationStatus;
  searchQuery: string;
  sortBy: "newest" | "oldest" | "name";
  images: ImageMetadata[];
  loading: boolean;
  onSelectImage: (image: ImageMetadata) => void;
  activeLabel?: string | null;
}

export default function GalleryGrid({
  activeFilter,
  searchQuery,
  sortBy,
  images,
  loading,
  onSelectImage,
  activeLabel,
}: GalleryGridProps) {
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(20); // Start with 20 images
  // Add an imageLoading state to track loading status for each image
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  // Use intersection observer for infinite scrolling
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Use useEffect to indicate when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredAndSortedImages = useMemo(() => {
    if (!isClient || !images.length) return [];

    // Filter images
    const filtered = images.filter((image) => {
      // Filter based on the selected category
      let matchesFilter = true;
      if (activeFilter === "approved") {
        // "approved" is now "People" filter
        matchesFilter = image.faces > 0;
      } else if (activeFilter === "flagged") {
        // "flagged" is now "Objects" filter
        matchesFilter =
          image.labels &&
          image.labels.length > 0 &&
          image.labels.some(
            (label) => !["People", "Person", "Human", "Face"].includes(label)
          );
      } else if (activeFilter === "pending") {
        // "pending" is now "Places" filter
        matchesFilter = !!image.location && image.location !== "";
      } else if (activeFilter === "text") {
        // "text" is for images with detected text
        matchesFilter =
          image.rekognitionDetails?.text &&
          image.rekognitionDetails.text.length > 0;
      }

      // Filter by active label if selected and the prop is provided
      if (activeLabel) {
        matchesFilter =
          matchesFilter && image.labels && image.labels.includes(activeLabel);
      }

      // Search in filename, labels, and location
      const matchesSearch =
        searchQuery === "" ||
        image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (image.labels &&
          image.labels.some((label) =>
            label.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        (image.location &&
          image.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (image.rekognitionDetails?.text &&
          image.rekognitionDetails.text.some((text) =>
            text.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      return matchesFilter && matchesSearch;
    });

    // Sort filtered images
    return [...filtered].sort((a, b) => {
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
    });
  }, [isClient, images, activeFilter, searchQuery, activeLabel, sortBy]);

  // Load more images when scrolling to the bottom
  useEffect(() => {
    if (inView && filteredAndSortedImages.length > visibleCount) {
      // Use requestAnimationFrame to avoid layout thrashing
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          setVisibleCount((prev) =>
            Math.min(prev + 12, filteredAndSortedImages.length)
          );
        });
      }, 100); // Small delay to batch updates

      return () => clearTimeout(timeoutId);
    }
  }, [inView, filteredAndSortedImages.length, visibleCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDropdownId) {
        setShowDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdownId]);

  // Get visible images based on current count
  const visibleImages = useMemo(() => {
    return filteredAndSortedImages.slice(0, visibleCount);
  }, [filteredAndSortedImages, visibleCount]);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdownId(showDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      // Use a fixed format that will be consistent between server and client
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Unknown date";
      }
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
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  const getStatusIcon = (image: ImageMetadata) => {
    if (image.faces > 0) {
      return <Users className="h-4 w-4" />;
    } else if (
      image.rekognitionDetails?.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return <Text className="h-4 w-4" />;
    } else if (image.location) {
      return <MapPin className="h-4 w-4" />;
    } else {
      return <Tag className="h-4 w-4" />;
    }
  };

  const getStatusClass = (image: ImageMetadata) => {
    if (image.faces > 0) {
      return "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white border-indigo-700 dark:border-indigo-600";
    } else if (
      image.rekognitionDetails?.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return "bg-blue-600 text-white dark:bg-blue-500 dark:text-white border-blue-700 dark:border-blue-600";
    } else if (image.location) {
      return "bg-green-600 text-white dark:bg-green-500 dark:text-white border-green-700 dark:border-green-600";
    } else {
      return "bg-purple-600 text-white dark:bg-purple-500 dark:text-white border-purple-700 dark:border-purple-600";
    }
  };

  const getStatusText = (image: ImageMetadata) => {
    if (image.faces > 0) {
      return `${image.faces} ${image.faces === 1 ? "Person" : "People"}`;
    } else if (
      image.rekognitionDetails?.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return "Text";
    } else if (image.location) {
      return image.location;
    } else {
      return image.labels && image.labels.length > 0
        ? image.labels[0]
        : "Image";
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  // Add this function to handle image loading start
  const handleImageLoadStart = (imageId: string) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: true }));
  };

  // Add this function to handle image loading completion
  const handleImageLoadComplete = (imageId: string) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = async (imageId: string, image: ImageMetadata) => {
    console.error(`Failed to load image: ${imageId}`);

    // Try to refresh the URL if we have the key
    if (image.key) {
      try {
        const refreshedUrl = await refreshImageUrl(image.key);
        // Update the image URL
        image.url = refreshedUrl;
        // Force a re-render by updating the error state
        setImageErrors((prev) => ({ ...prev, [imageId]: false }));
        return;
      } catch (error) {
        console.error("Failed to refresh image URL:", error);
      }
    }

    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  };

  // Generate a placeholder image URL with the filename
  const getPlaceholderUrl = (image: ImageMetadata) => {
    const filename = image.filename || "image";
    return `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
      filename
    )}`;
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

  // Optimize the loading state with more efficient skeleton UI
  if (loading) {
    return (
      <div className="min-h-[400px] animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`skeleton-image-${i}`}
              className="bg-card rounded-xl shadow-sm border border-border overflow-hidden"
            >
              <div className="aspect-square bg-muted skeleton-loading"></div>
              <div className="p-4">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse mb-2"></div>
                <div className="flex gap-1 mt-2">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get filter description
  const getFilterDescription = () => {
    if (activeFilter === "approved") return "people";
    if (activeFilter === "flagged") return "objects";
    if (activeFilter === "pending") return "places";
    if (activeFilter === "text") return "text";
    return "";
  };

  return (
    <>
      {filteredAndSortedImages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-xl shadow-sm border border-border p-12 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No photos found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeFilter !== "all"
              ? `No photos with ${getFilterDescription()} found. Try changing your filter or uploading new images.`
              : searchQuery
              ? "No photos match your search. Try a different search term."
              : "You haven't uploaded any photos yet. Upload some photos to see them here."}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {visibleImages.map((image, index) => (
                <motion.div
                  key={
                    image.id || `image-${image.filename}-${image.lastModified}`
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg card-transition"
                >
                  <div className="relative aspect-square group overflow-hidden transition-all duration-200 rounded-t-xl hover-transition">
                    {/* Image container with fallback */}
                    <div
                      className="absolute inset-0 bg-muted flex items-center justify-center cursor-pointer"
                      onClick={() => onSelectImage(image)}
                    >
                      {!imageErrors[image.id] ? (
                        <>
                          {/* Show skeleton loader while image is loading */}
                          {(imageLoading[image.id] === undefined ||
                            imageLoading[image.id]) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                              <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                          )}
                          <img
                            src={image.url || getPlaceholderUrl(image)}
                            alt={image.filename}
                            className={`w-full h-full object-cover img-loading-transition ${
                              imageLoading[image.id]
                                ? "opacity-0"
                                : "opacity-100"
                            }`}
                            loading="lazy"
                            onLoad={() => handleImageLoadComplete(image.id)}
                            onLoadStart={() => handleImageLoadStart(image.id)}
                            onError={() => handleImageError(image.id, image)}
                            crossOrigin="anonymous"
                          />
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {image.filename || "Image unavailable"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Access denied or image expired
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* View button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelectImage(image)}
                        className="bg-white/90 dark:bg-card/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-card transition-colors"
                      >
                        <Eye className="h-5 w-5 text-foreground" />
                      </motion.button>
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusClass(
                          image
                        )}`}
                      >
                        {getStatusIcon(image)}
                        <span className="ml-1">{getStatusText(image)}</span>
                      </span>
                    </div>

                    {/* Location badge */}
                    {image.location &&
                      !image.location.includes(getStatusText(image)) && (
                        <div className="absolute bottom-2 left-2 right-2 z-10">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/70 text-white border border-white/20">
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
                        {image.filename || `Image ${image.id?.substring(0, 8)}`}
                      </h3>
                      <div className="relative">
                        <button
                          onClick={(e) => toggleDropdown(image.id, e)}
                          className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                        {showDropdownId === image.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-card rounded-md shadow-lg z-10 border border-border">
                            <div className="py-1">
                              <button
                                onClick={() => onSelectImage(image)}
                                className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              <a
                                href={image.url}
                                download={image.filename}
                                target="_blank"
                                rel="noopener noreferrer"
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
                      {image.lastModified
                        ? formatDate(image.lastModified)
                        : "Unknown date"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {image.labels && image.labels.length > 0 ? (
                        <>
                          {image.labels.slice(0, 3).map((label, index) => (
                            <span
                              key={`${image.id}-label-${index}`}
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
                          {image.size
                            ? formatFileSize(image.size)
                            : "Unknown size"}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load more trigger */}
          {visibleCount < filteredAndSortedImages.length && (
            <div ref={ref} className="flex justify-center mt-8 pb-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}
    </>
  );
}
