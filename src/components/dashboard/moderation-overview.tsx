"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Tag, Users, Search } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { ImageMetadata } from "@/types/image";
import useSWR from "swr";

// Add SWR fetcher function
const fetcher = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

const formatTimeAgo = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString();
};

export default function ModerationOverview() {
  const { user, session } = useAuth();
  const token = session?.access_token;

  // Use SWR for data fetching with caching and revalidation
  const { data, error, isLoading } = useSWR(
    token ? ["/api/images", token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Memoize statistics calculations to avoid recalculating on every render
  const { photoStats, topCategories, recentActivity } = useMemo(() => {
    if (!data?.images || data.images.length === 0) {
      return {
        photoStats: {
          totalImages: 0,
          peopleDetected: 0,
          objectsLabeled: 0,
          textDetected: 0,
          lastUpload: "N/A",
        },
        topCategories: [],
        recentActivity: [],
      };
    }

    const images = data.images;

    // Calculate basic stats
    const totalImages = images.length;
    const peopleDetected = images.reduce(
      (sum: number, img: ImageMetadata) => sum + (img.faces || 0),
      0
    );

    // Count all labels
    const allLabels: string[] = [];
    const labelCounts: Record<string, number> = {};

    // Count text detected images
    const textDetected = images.filter(
      (img: ImageMetadata) =>
        img.rekognitionDetails?.text && img.rekognitionDetails.text.length > 0
    ).length;

    // Process all labels and count occurrences
    images.forEach((img: ImageMetadata) => {
      if (img.labels && img.labels.length) {
        img.labels.forEach((label) => {
          allLabels.push(label);
          labelCounts[label] = (labelCounts[label] || 0) + 1;
        });
      }
    });

    // Get top categories
    const topCats = Object.entries(labelCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Get recent activity (5 most recent images)
    const recent = [...images]
      .sort((a, b) => {
        const dateA = new Date(a.lastModified).getTime();
        const dateB = new Date(b.lastModified).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((img) => ({
        id: img.id,
        filename: img.filename,
        timestamp: formatTimeAgo(img.lastModified),
        labels: img.labels || [],
        faces: img.faces || 0,
        confidence: img.rekognitionDetails?.labels?.[0]?.confidence || 95,
        imageUrl: img.url,
      }));

    // Find last upload time
    const lastUpload = recent.length > 0 ? recent[0].timestamp : "N/A";

    return {
      photoStats: {
        totalImages,
        peopleDetected,
        objectsLabeled: allLabels.length,
        textDetected,
        lastUpload,
      },
      topCategories: topCats,
      recentActivity: recent,
    };
  }, [data?.images]);

  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  // Add these functions to handle image loading states
  const handleImageLoadStart = (imageId: string) => {
    if (!imageLoading[imageId]) {
      setImageLoading((prev) => ({ ...prev, [imageId]: true }));
    }
  };

  const handleImageLoadComplete = (imageId: string) => {
    if (imageLoading[imageId]) {
      setImageLoading((prev) => ({ ...prev, [imageId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Photo Analysis Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Smart photo organization powered by AWS Rekognition
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skeleton-stat-${i}`}
              className="bg-card rounded-xl shadow-sm border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                <div className="p-2 bg-muted rounded-lg w-9 h-9"></div>
              </div>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`skeleton-category-${i}`}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-muted mr-3"></div>
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="overflow-hidden">
              <div className="h-8 w-full bg-muted rounded animate-pulse mb-4"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-row-${i}`}
                  className="h-16 w-full bg-muted rounded animate-pulse mb-2"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            Photo Analysis Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Smart photo organization powered by AWS Rekognition
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-700 dark:text-red-500">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Photo Analysis Dashboard
        </h2>
        <p className="text-muted-foreground mt-1">
          Smart photo organization powered by AWS Rekognition
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 contain-layout">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Total Photos
            </h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {photoStats.totalImages}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last upload {photoStats.lastUpload}
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              People Detected
            </h3>
            <div className="p-2 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {photoStats.peopleDetected}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Across {photoStats.totalImages} photos
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Objects Labeled
            </h3>
            <div className="p-2 bg-purple-500/10 dark:bg-purple-400/10 rounded-lg">
              <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {photoStats.objectsLabeled}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Auto-categorized by AI
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Text Detected
            </h3>
            <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
              <Search className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {photoStats.textDetected}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Searchable content
          </p>
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 contain-layout">
        <div className="lg:col-span-1 bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Top Categories
            </h3>
            <button className="text-sm text-primary hover:text-primary/90 font-medium">
              View All
            </button>
          </div>

          {topCategories.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {topCategories.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                      <Tag className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {category.count} photos
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No categories found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload photos to see categories
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <button className="w-full py-2 text-sm text-center text-primary font-medium hover:text-primary/90">
              Manage Categories
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              Recently Analyzed Photos
            </h3>
            <button className="text-sm text-primary hover:text-primary/90 font-medium">
              View All
            </button>
          </div>

          {recentActivity.length > 0 ? (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full table-fixed">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 border-b border-border w-[40%]">
                      Photo
                    </th>
                    <th className="px-4 py-3 border-b border-border w-[15%]">
                      Time
                    </th>
                    <th className="px-4 py-3 border-b border-border w-[20%]">
                      Labels
                    </th>
                    <th className="px-4 py-3 border-b border-border w-[10%]">
                      Faces
                    </th>
                    <th className="px-4 py-3 border-b border-border w-[15%]">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentActivity.map((item) => (
                    <tr
                      key={item.id || `activity-${item.filename}`}
                      className="hover:bg-muted/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-muted rounded-md flex items-center justify-center overflow-hidden relative">
                            {item.imageUrl ? (
                              <>
                                {/* Show skeleton loader while image is loading */}
                                {(imageLoading[item.id] === undefined ||
                                  imageLoading[item.id]) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                  </div>
                                )}
                                <img
                                  src={item.imageUrl || "/placeholder.svg"}
                                  alt={item.filename}
                                  className={`h-full w-full object-cover will-change-opacity transition-opacity duration-300 ${
                                    imageLoading[item.id]
                                      ? "opacity-0"
                                      : "opacity-100"
                                  }`}
                                  loading="lazy"
                                  onLoad={() =>
                                    handleImageLoadComplete(item.id)
                                  }
                                  onLoadStart={() =>
                                    handleImageLoadStart(item.id)
                                  }
                                  onError={() => {
                                    console.error(
                                      `Failed to load thumbnail for ${item.id}`
                                    );
                                    handleImageLoadComplete(item.id);
                                  }}
                                  crossOrigin="anonymous"
                                />
                              </>
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="ml-3 max-w-[calc(100%-3rem)]">
                            <p
                              className="text-sm font-medium text-foreground truncate"
                              title={item.filename}
                            >
                              {item.filename}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-muted-foreground">
                          {item.timestamp}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.labels
                            .slice(0, 2)
                            .map((label: string, index: number) => (
                              <span
                                key={`${item.id}-label-${index}`}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                              >
                                {label}
                              </span>
                            ))}
                          {item.labels.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              +{item.labels.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <Users className="mr-1 h-3 w-3" />
                          {item.faces}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-12 bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${item.confidence}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload photos to see recent activity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
