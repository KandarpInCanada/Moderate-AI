"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import type { ModerationStatus } from "./gallery-container";
import ImageDetailModal from "./image-detail-modal";

const sampleImages = [
  {
    id: "img1",
    filename: "beach-vacation.jpg",
    uploadDate: "2025-04-05T14:30:00Z",
    status: "approved",
    confidence: 99.2,
    url: "/tropical-beach-paradise.png",
    size: "2.4 MB",
    dimensions: "1920 x 1080",
    moderationDetails: {
      categories: {
        violence: 0.01,
        adult: 0.02,
        sensitive: 0.01,
      },
      moderatedAt: "2025-04-05T14:35:00Z",
    },
  },
  {
    id: "img2",
    filename: "profile-photo-3.png",
    uploadDate: "2025-04-04T10:15:00Z",
    status: "flagged",
    confidence: 87.5,
    url: "/thoughtful-gaze.png", // Correct path
    size: "1.8 MB",
    dimensions: "1200 x 1200",
    moderationDetails: {
      categories: {
        violence: 0.01,
        adult: 0.87,
        sensitive: 0.65,
      },
      reason: "Potential adult content",
      moderatedAt: "2025-04-04T10:20:00Z",
    },
  },
  {
    id: "img3",
    filename: "marketing-banner.jpg",
    uploadDate: "2025-04-03T16:45:00Z",
    status: "approved",
    confidence: 98.7,
    url: "/strategic-marketing-meeting.png",
    size: "3.2 MB",
    dimensions: "2560 x 1440",
    moderationDetails: {
      categories: {
        violence: 0.01,
        adult: 0.01,
        sensitive: 0.02,
      },
      moderatedAt: "2025-04-03T16:50:00Z",
    },
  },
  {
    id: "img4",
    filename: "event-photo.jpg",
    uploadDate: "2025-04-03T09:20:00Z",
    status: "pending",
    confidence: 65.3,
    url: "/assorted-products-display.png",
    size: "4.1 MB",
    dimensions: "3840 x 2160",
    moderationDetails: {
      categories: {
        violence: 0.35,
        adult: 0.25,
        sensitive: 0.45,
      },
    },
  },
  {
    id: "img5",
    filename: "product-image.png",
    uploadDate: "2025-04-02T13:10:00Z",
    status: "approved",
    confidence: 99.8,
    url: "/assorted-products-display.png",
    size: "1.5 MB",
    dimensions: "1500 x 1500",
    moderationDetails: {
      categories: {
        violence: 0.01,
        adult: 0.01,
        sensitive: 0.01,
      },
      moderatedAt: "2025-04-02T13:15:00Z",
    },
  },
  {
    id: "img6",
    filename: "family-photo.jpg",
    uploadDate: "2025-04-01T18:30:00Z",
    status: "approved",
    confidence: 97.9,
    url: "/tropical-beach-paradise.png",
    size: "2.8 MB",
    dimensions: "2048 x 1536",
    moderationDetails: {
      categories: {
        violence: 0.01,
        adult: 0.01,
        sensitive: 0.02,
      },
      moderatedAt: "2025-04-01T18:35:00Z",
    },
  },
  {
    id: "img7",
    filename: "screenshot.png",
    uploadDate: "2025-03-31T11:45:00Z",
    status: "pending",
    confidence: 72.1,
    url: "/strategic-marketing-meeting.png",
    size: "0.9 MB",
    dimensions: "1920 x 1080",
    moderationDetails: {
      categories: {
        violence: 0.15,
        adult: 0.22,
        sensitive: 0.35,
      },
    },
  },
  {
    id: "img8",
    filename: "graphic-design.jpg",
    uploadDate: "2025-03-30T14:20:00Z",
    status: "flagged",
    confidence: 82.3,
    url: "/thoughtful-gaze.png",
    size: "3.5 MB",
    dimensions: "3000 x 2000",
    moderationDetails: {
      categories: {
        violence: 0.75,
        adult: 0.15,
        sensitive: 0.45,
      },
      reason: "Potential violent content",
      moderatedAt: "2025-03-30T14:25:00Z",
    },
  },
];

interface GalleryGridProps {
  activeFilter: ModerationStatus;
  searchQuery: string;
  sortBy: "newest" | "oldest" | "name";
}

export default function GalleryGrid({
  activeFilter,
  searchQuery,
  sortBy,
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<
    (typeof sampleImages)[0] | null
  >(null);
  const [showDropdownId, setShowDropdownId] = useState<string | null>(null);
  const filteredImages = sampleImages.filter((image) => {
    const matchesFilter =
      activeFilter === "all" || image.status === activeFilter;
    const matchesSearch = image.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortBy === "newest") {
      return (
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
    } else if (sortBy === "oldest") {
      return (
        new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
      );
    } else {
      return a.filename.localeCompare(b.filename);
    }
  });

  const toggleDropdown = (id: string) => {
    setShowDropdownId(showDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50";
      case "flagged":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <>
      {sortedImages.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No images found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeFilter !== "all"
              ? `No ${activeFilter} images found. Try changing your filter or uploading new images.`
              : searchQuery
              ? "No images match your search. Try a different search term."
              : "You haven't uploaded any images yet. Upload some images to see them here."}
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
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.filename}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                      image.status
                    )}`}
                  >
                    {getStatusIcon(image.status)}
                    <span className="ml-1 capitalize">{image.status}</span>
                  </span>
                </div>
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
                          <button className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </button>
                          <button className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(image.uploadDate)}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        image.confidence > 90
                          ? "bg-green-500"
                          : image.confidence > 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${image.confidence}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {image.confidence}%
                  </span>
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
