"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Sidebar from "@/components/dashboard/sidebar";
import {
  ArrowLeft,
  Folder,
  Users,
  MapPin,
  Tag,
  Calendar,
  Download,
  Share2,
  ImageIcon,
} from "lucide-react";
import type { ImageMetadata } from "@/types/image";
import useSWR from "swr";

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

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading, session } = useAuth();
  const token = session?.access_token;

  const [collectionImages, setCollectionImages] = useState<ImageMetadata[]>([]);
  const [collectionInfo, setCollectionInfo] = useState({
    name: "",
    type: "",
    count: 0,
  });

  // Add this state for image loading
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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Add these functions to handle image loading states
  const handleImageLoadStart = (imageId: string) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoadComplete = (imageId: string) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  // Filter images based on collection ID
  useEffect(() => {
    if (data?.images && params.id) {
      const collectionId = params.id as string;
      let filteredImages: ImageMetadata[] = [];
      let name = "";
      let type = "";

      // Parse collection ID to determine filter type
      if (collectionId === "people") {
        // People collection
        filteredImages = data.images.filter(
          (img: ImageMetadata) => img.faces && img.faces > 0
        );
        name = "People";
        type = "people";
      } else if (collectionId.startsWith("location-")) {
        // Location collection
        const locationName = collectionId
          .replace("location-", "")
          .replace(/-/g, " ");
        filteredImages = data.images.filter(
          (img: ImageMetadata) =>
            img.location && img.location.toLowerCase() === locationName
        );
        name = filteredImages[0]?.location || locationName;
        type = "location";
      } else if (collectionId.startsWith("label-")) {
        // Label collection
        const labelName = collectionId.replace("label-", "").replace(/-/g, " ");
        filteredImages = data.images.filter(
          (img: ImageMetadata) =>
            img.labels &&
            img.labels.some(
              (label: string) => label.toLowerCase() === labelName
            )
        );
        name = labelName.charAt(0).toUpperCase() + labelName.slice(1);
        type = "object";
      } else if (collectionId.startsWith("date-")) {
        // Date collection
        const dateName = collectionId.replace("date-", "").replace(/-/g, " ");

        // Filter by month/year
        filteredImages = data.images.filter((img: ImageMetadata) => {
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

        name = dateName
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        type = "date";
      }

      setCollectionImages(filteredImages);
      setCollectionInfo({
        name,
        type,
        count: filteredImages.length,
      });
    }
  }, [data, params.id]);

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  const getCollectionIcon = () => {
    switch (collectionInfo.type) {
      case "people":
        return <Users className="h-6 w-6 text-indigo-500" />;
      case "location":
        return <MapPin className="h-6 w-6 text-green-500" />;
      case "object":
        return <Tag className="h-6 w-6 text-purple-500" />;
      case "date":
        return <Calendar className="h-6 w-6 text-blue-500" />;
      default:
        return <Folder className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="gallery" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Collections
            </button>

            {/* Collection header */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mr-4 overflow-hidden border-2 border-muted">
                    {collectionImages.length > 0 ? (
                      <img
                        src={
                          collectionImages[0].url ||
                          `/placeholder.svg?height=200&width=200`
                        }
                        alt={collectionInfo.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `/placeholder.svg?height=200&width=200`;
                        }}
                      />
                    ) : (
                      getCollectionIcon()
                    )}
                  </div>
                  <div>
                    <div
                      className={`
                      inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium mb-1
                      ${collectionInfo.type === "people" ? "bg-indigo-500" : ""}
                      ${
                        collectionInfo.type === "location" ? "bg-green-500" : ""
                      }
                      ${collectionInfo.type === "object" ? "bg-purple-500" : ""}
                      ${collectionInfo.type === "date" ? "bg-blue-500" : ""}
                    `}
                    >
                      {getCollectionIcon()}
                      <span className="ml-1">{collectionInfo.name}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {collectionInfo.count} photos
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </button>
                  <button className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Collection
                  </button>
                </div>
              </div>
            </div>

            {/* Collection grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-muted-foreground">Loading collection...</p>
                </div>
              </div>
            ) : collectionImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {collectionImages.map((image: ImageMetadata) => (
                  <div
                    key={image.id}
                    className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200"
                  >
                    <div className="relative aspect-square overflow-hidden group">
                      {/* Show skeleton loader while image is loading */}
                      {(imageLoading[image.id] === undefined ||
                        imageLoading[image.id]) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <img
                        src={
                          image.url ||
                          `/placeholder.svg?height=400&width=400&text=${
                            encodeURIComponent(image.filename) ||
                            "/placeholder.svg"
                          }`
                        }
                        alt={image.filename}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                          imageLoading[image.id] ? "opacity-0" : "opacity-100"
                        } group-hover:scale-110`}
                        loading="lazy"
                        onLoad={() => handleImageLoadComplete(image.id)}
                        onLoadStart={() => handleImageLoadStart(image.id)}
                        onError={(e) => {
                          e.currentTarget.src = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
                            image.filename
                          )}`;
                          handleImageLoadComplete(image.id);
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3
                        className="font-medium text-foreground truncate"
                        title={image.filename}
                      >
                        {image.filename}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {image.labels &&
                          image.labels.slice(0, 3).map((label, index) => (
                            <span
                              key={`${image.id}-label-${index}`}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {label}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="bg-card rounded-xl shadow-sm border border-border p-12 text-center"
                key="empty-collection"
              >
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No images in this collection
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This collection is empty. Try uploading more photos or
                  selecting a different collection.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
