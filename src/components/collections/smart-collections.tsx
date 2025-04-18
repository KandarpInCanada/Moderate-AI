"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Folder,
  Users,
  MapPin,
  Tag,
  ImageIcon,
  Calendar,
  Sparkles,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { ImageMetadata } from "@/types/image";
import useSWR from "swr";
import Link from "next/link";

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

export default function SmartCollections() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [collections, setCollections] = useState<SmartCollection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

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

  const handleImageLoadStart = (collectionId: string) => {
    setImageLoading((prev) => ({ ...prev, [collectionId]: true }));
  };

  const handleImageLoadComplete = (collectionId: string) => {
    setImageLoading((prev) => ({ ...prev, [collectionId]: false }));
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
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-collection-${i}`}
              className="flex flex-col items-center"
            >
              <div className="w-40 h-40 rounded-full bg-muted skeleton-loading mb-3"></div>
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
          Error Loading Collections
        </h3>
        <p className="text-red-700 dark:text-red-500">{error.message}</p>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Folder className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No collections yet
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Upload more photos to automatically generate smart collections based
          on content.
        </p>
      </div>
    );
  }

  // Replace the grid section with the new circular layout
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <Link
            href={`/collection/${collection.id}`}
            key={collection.id}
            className="flex flex-col items-center group"
          >
            <div className="relative mb-3">
              {/* Square image container with optimized transitions */}
              <div className="w-40 h-40 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary hover-transition shadow-md group-hover:shadow-lg">
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
                      } group-hover:scale-110`}
                      loading="lazy"
                      onLoad={() => handleImageLoadComplete(collection.id)}
                      onLoadStart={() => handleImageLoadStart(collection.id)}
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

                {/* Center eye icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-white/80 dark:bg-white/70 rounded-full p-3 shadow-lg">
                    <Eye className="h-6 w-6 text-gray-800" />
                  </div>
                </div>
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
          </Link>
        ))}
      </div>
    </div>
  );
}
