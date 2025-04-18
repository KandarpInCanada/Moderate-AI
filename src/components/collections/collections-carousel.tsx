"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Users,
  MapPin,
  Tag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ImageIcon,
} from "lucide-react";
import type { ImageMetadata } from "@/types/image";
import useSWR from "swr";
import { motion } from "framer-motion";

// Fetcher function for SWR
const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

type SmartCollection = {
  id: string;
  name: string;
  type: "people" | "location" | "object" | "date" | "custom";
  count: number;
  coverImage?: string;
  icon: React.ReactNode;
};

interface CollectionsCarouselProps {
  onCollectionSelect?: (collectionId: string) => void;
}

export default function CollectionsCarousel({
  onCollectionSelect = () => {},
}: CollectionsCarouselProps) {
  const { session } = useAuth();
  const token = session?.access_token;
  const carouselRef = useRef<HTMLDivElement>(null);

  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch all images
  const { data, error, isLoading } = useSWR(
    token ? ["/api/images", token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Generate collections when data is available
  useEffect(() => {
    if (data?.images && data.images.length > 0) {
      generateCollections(data.images);
    }
  }, [data]);

  // Check scroll position
  useEffect(() => {
    const checkScroll = () => {
      if (!carouselRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", checkScroll);
      // Initial check
      checkScroll();
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener("scroll", checkScroll);
      }
    };
  }, [collections]);

  const handleImageLoadStart = (collectionId: string) => {
    setImageLoading((prev) => ({ ...prev, [collectionId]: true }));
  };

  const handleImageLoadComplete = (collectionId: string) => {
    setImageLoading((prev) => ({ ...prev, [collectionId]: false }));
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const generateCollections = async (images: ImageMetadata[]) => {
    setIsGenerating(true);

    try {
      // People collections (based on face count)
      const peopleImages = images.filter((img) => img.faces && img.faces > 0);

      // Location collections
      const locationMap = new Map<string, ImageMetadata[]>();
      images.forEach((img) => {
        if (img.location && img.location.trim() !== "") {
          if (!locationMap.has(img.location)) {
            locationMap.set(img.location, []);
          }
          locationMap.get(img.location)?.push(img);
        }
      });

      // Object/label collections (get top 5 most common labels)
      const labelCounts = new Map<string, number>();
      images.forEach((img) => {
        if (img.labels && img.labels.length) {
          img.labels.forEach((label) => {
            labelCounts.set(label, (labelCounts.get(label) || 0) + 1);
          });
        }
      });

      const topLabels = Array.from(labelCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label]) => label);

      // Date-based collections (by month/year)
      const dateMap = new Map<string, ImageMetadata[]>();
      images.forEach((img) => {
        try {
          const date = new Date(img.lastModified);
          const monthYear = `${date.toLocaleString("default", {
            month: "long",
          })} ${date.getFullYear()}`;

          if (!dateMap.has(monthYear)) {
            dateMap.set(monthYear, []);
          }
          dateMap.get(monthYear)?.push(img);
        } catch (e) {
          // Skip images with invalid dates
        }
      });

      // Build collections array
      const newCollections: SmartCollection[] = [
        // People collection
        {
          id: "people",
          name: "People",
          type: "people",
          count: peopleImages.length,
          coverImage: peopleImages[0]?.url,
          icon: <Users className="h-5 w-5" />,
        },

        // Location collections
        ...Array.from(locationMap.entries())
          .filter(([_, imgs]) => imgs.length >= 3) // Only locations with at least 3 images
          .map(([location, imgs]) => ({
            id: `location-${location.toLowerCase().replace(/\s+/g, "-")}`,
            name: location,
            type: "location" as const,
            count: imgs.length,
            coverImage: imgs[0]?.url,
            icon: <MapPin className="h-5 w-5" />,
          })),

        // Label/object collections
        ...topLabels.map((label: string) => {
          const labelImages = images.filter(
            (img: ImageMetadata) => img.labels && img.labels.includes(label)
          );
          return {
            id: `label-${label.toLowerCase().replace(/\s+/g, "-")}`,
            name: label,
            type: "object" as const,
            count: labelImages.length,
            coverImage: labelImages[0]?.url,
            icon: <Tag className="h-5 w-5" />,
          };
        }),

        // Date collections
        ...Array.from(dateMap.entries())
          .filter(([_, imgs]) => imgs.length >= 3) // Only dates with at least 3 images
          .sort((a, b) => {
            // Sort by date (newest first)
            const dateA = new Date(a[1][0].lastModified);
            const dateB = new Date(b[1][0].lastModified);
            return dateB.getTime() - dateA.getTime();
          })
          .map(([monthYear, imgs]) => ({
            id: `date-${monthYear.toLowerCase().replace(/\s+/g, "-")}`,
            name: monthYear,
            type: "date" as const,
            count: imgs.length,
            coverImage: imgs[0]?.url,
            icon: <Calendar className="h-5 w-5" />,
          })),
      ];

      setCollections(newCollections);
    } catch (error) {
      console.error("Error generating collections:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="relative">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Smart Collections
          </h2>
        </div>
        <div className="overflow-hidden">
          <div className="flex space-x-4 py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`skeleton-collection-${i}`}
                className="flex-shrink-0 w-40"
              >
                <div className="w-40 h-40 rounded-xl bg-muted skeleton-loading mb-3"></div>
                <div className="h-4 w-20 bg-muted rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 mb-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
          Error Loading Collections
        </h3>
        <p className="text-red-700 dark:text-red-500">{error.message}</p>
      </div>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Smart Collections
        </h2>
        <button
          onClick={() => data?.images && generateCollections(data.images)}
          className="text-sm text-primary hover:text-primary/90 font-medium"
        >
          Refresh Collections
        </button>
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: canScrollLeft ? 1 : 0 }}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md border border-border"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </motion.button>

        {/* Right scroll button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: canScrollRight ? 1 : 0 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md border border-border"
          onClick={scrollRight}
          disabled={!canScrollRight}
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </motion.button>

        {/* Carousel container */}
        <div
          ref={carouselRef}
          className="overflow-x-auto hide-scrollbar pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex space-x-6 py-2">
            {collections.map((collection, index) => (
              <button
                onClick={() => onCollectionSelect(collection.id)}
                key={collection.id}
                className="flex-shrink-0 w-44 text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className="flex flex-col items-center group"
                >
                  <div className="relative mb-3 w-44 h-44">
                    {/* Square image container with optimized transitions */}
                    <div className="w-44 h-44 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary hover-transition shadow-md group-hover:shadow-lg">
                      {collection.coverImage ? (
                        <>
                          {/* Show skeleton loader while image is loading */}
                          {(imageLoading[collection.id] === undefined ||
                            imageLoading[collection.id]) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse rounded-lg">
                              <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                          <img
                            src={collection.coverImage || "/placeholder.svg"}
                            alt={collection.name}
                            className={`w-full h-full object-cover img-loading-transition ${
                              imageLoading[collection.id]
                                ? "opacity-0"
                                : "opacity-100"
                            } group-hover:scale-110 transition-all duration-500`}
                            loading="lazy"
                            onLoad={() =>
                              handleImageLoadComplete(collection.id)
                            }
                            onLoadStart={() =>
                              handleImageLoadStart(collection.id)
                            }
                            onError={(e) => {
                              e.currentTarget.src = `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(
                                collection.name
                              )}`;
                              handleImageLoadComplete(collection.id);
                            }}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Collection type badge - position adjusted for square containers */}
                    <div
                      className={`
                        absolute bottom-2 left-2 rounded-md px-3 py-1 text-white font-medium text-sm flex items-center
                        ${collection.type === "people" ? "bg-indigo-500" : ""}
                        ${collection.type === "location" ? "bg-green-500" : ""}
                        ${collection.type === "object" ? "bg-purple-500" : ""}
                        ${collection.type === "date" ? "bg-blue-500" : ""}
                        ${collection.type === "custom" ? "bg-primary" : ""}
                      `}
                    >
                      {collection.icon}
                      <span className="ml-1">{collection.name}</span>
                    </div>
                  </div>

                  {/* Collection info */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {collection.count} photos
                    </p>
                  </div>
                </motion.div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
