"use client";

import {
  Tag,
  Users,
  MapPin,
  Download,
  ArrowLeft,
  Edit,
  Text,
  Clock,
  Info,
  ImageIcon,
} from "lucide-react";
import type { ImageMetadata } from "@/types/image";
import { useState, useEffect } from "react";
import { refreshImageUrl } from "@/lib/s3-client";

interface ImageDetailViewProps {
  image: ImageMetadata;
  onBack: () => void;
}

export default function ImageDetailView({
  image,
  onBack,
}: ImageDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"info" | "labels" | "text">(
    "info"
  );
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    // Reset image error state when image changes
    setImageError(false);
  }, [image]);

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
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${month} ${day}, ${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
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

  // Generate a placeholder image URL with the filename
  const getPlaceholderUrl = () => {
    const filename = image.filename || "image";
    return `/placeholder.svg?height=800&width=800&text=${encodeURIComponent(
      filename
    )}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Gallery
      </button>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {image.filename}
          </h2>
          <p className="text-sm text-muted-foreground">
            Uploaded {formatDate(image.lastModified)}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Image section - fixed size container */}
          <div className="lg:w-3/5 bg-muted flex items-center justify-center p-0 h-[500px] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center relative">
              {!imageError ? (
                <>
                  {/* Loading skeleton */}
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Loading image...
                        </p>
                      </div>
                    </div>
                  )}
                  <img
                    src={image.url || getPlaceholderUrl()}
                    alt={image.filename}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                      isImageLoading ? "opacity-0" : "opacity-100"
                    }`}
                    onLoad={() => setIsImageLoading(false)}
                    onLoadStart={() => setIsImageLoading(true)}
                    onError={async (e) => {
                      // Try to refresh the URL if it's a 403 error (likely expired pre-signed URL)
                      if (image.key && image.url) {
                        try {
                          // Only attempt to refresh if we have the necessary data
                          const refreshedUrl = await refreshImageUrl(image.key);
                          // Update the image in place with the new URL
                          image.url = refreshedUrl;
                          // Retry loading with the new URL
                          e.currentTarget.src = refreshedUrl;
                          return;
                        } catch (refreshError) {
                          console.error(
                            "Failed to refresh image URL:",
                            refreshError
                          );
                        }
                      }

                      // If refresh fails or isn't possible, mark as error
                      setImageError(true);
                      setIsImageLoading(false);
                    }}
                    crossOrigin="anonymous"
                  />
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="h-16 w-16 bg-muted-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    {image.filename}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-2">
                    Access denied or image expired
                  </p>
                  <button
                    onClick={async () => {
                      if (image.key) {
                        try {
                          setIsImageLoading(true);
                          const refreshedUrl = await refreshImageUrl(image.key);
                          image.url = refreshedUrl;
                          setImageError(false);
                        } catch (error) {
                          console.error("Failed to refresh image:", error);
                          setIsImageLoading(false);
                        }
                      }
                    }}
                    className="mt-4 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Details section */}
          <div className="lg:w-2/5 p-6 overflow-y-auto border-t lg:border-t-0 lg:border-l border-border">
            {/* Tabs */}
            <div className="flex border-b border-border mb-4">
              <button
                onClick={() => setActiveTab("info")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "info"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Info className="h-4 w-4 inline-block mr-1" />
                Info
              </button>
              <button
                onClick={() => setActiveTab("labels")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "labels"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tag className="h-4 w-4 inline-block mr-1" />
                Labels
              </button>
              {image.rekognitionDetails.text &&
                image.rekognitionDetails.text.length > 0 && (
                  <button
                    onClick={() => setActiveTab("text")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "text"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Text className="h-4 w-4 inline-block mr-1" />
                    Text
                  </button>
                )}
            </div>

            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Basic info */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Uploaded
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(image.lastModified)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="text-sm font-medium text-foreground">
                      {formatFileSize(image.size)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Dimensions
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {image.dimensions || "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      File Path
                    </span>
                    <span
                      className="text-sm font-medium text-foreground truncate"
                      title={image.key}
                    >
                      {image.key}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Analysis Date
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(image.rekognitionDetails.analyzedAt)}
                    </span>
                  </div>
                </div>

                {/* Tags section */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {image.faces > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/30">
                      <Users className="h-4 w-4 mr-1" />
                      {image.faces} {image.faces === 1 ? "Person" : "People"}
                    </span>
                  )}
                  {image.location && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30">
                      <MapPin className="h-4 w-4 mr-1" />
                      {image.location}
                    </span>
                  )}
                  {image.rekognitionDetails.text &&
                    image.rekognitionDetails.text.length > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                        <Text className="h-4 w-4 mr-1" />
                        Text Detected
                      </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <a
                    href={image.url}
                    download={image.filename}
                    className="flex-1 flex justify-center items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download
                  </a>
                  <button className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90">
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Labels
                  </button>
                </div>
              </div>
            )}

            {activeTab === "labels" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  AI-Detected Labels
                </h3>

                {/* Labels with confidence */}
                {image.rekognitionDetails.labels &&
                image.rekognitionDetails.labels.length > 0 ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {image.rekognitionDetails.labels.map((label, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium text-foreground">
                              {label.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-24 bg-muted rounded-full h-1.5 mr-2">
                              <div
                                className="h-1.5 rounded-full bg-primary"
                                style={{ width: `${label.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-foreground">
                              {label.confidence.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No labels detected for this image
                    </p>
                  </div>
                )}

                {/* Faces */}
                {image.rekognitionDetails.faces > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      Faces Detected
                    </h4>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {image.rekognitionDetails.faces}{" "}
                          {image.rekognitionDetails.faces === 1
                            ? "person"
                            : "people"}{" "}
                          detected
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          AWS Rekognition detected{" "}
                          {image.rekognitionDetails.faces}{" "}
                          {image.rekognitionDetails.faces === 1
                            ? "face"
                            : "faces"}{" "}
                          in this image
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Celebrities */}
                {image.rekognitionDetails.celebrities &&
                  image.rekognitionDetails.celebrities.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-foreground mb-3">
                        Celebrities Recognized
                      </h4>
                      <div className="space-y-2">
                        {image.rekognitionDetails.celebrities.map(
                          (celebrity, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-foreground">
                                {celebrity.name}
                              </span>
                              <span className="text-xs text-foreground">
                                {celebrity.confidence.toFixed(1)}% confidence
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Analysis timestamp */}
                <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
                  <Clock className="h-3 w-3 mr-1" />
                  Analyzed on {formatDate(image.rekognitionDetails.analyzedAt)}
                </div>
              </div>
            )}

            {activeTab === "text" && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Detected Text
                </h3>

                {image.rekognitionDetails.text &&
                image.rekognitionDetails.text.length > 0 ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="space-y-3">
                      {image.rekognitionDetails.text.map((text, index) => (
                        <div
                          key={index}
                          className="p-3 bg-background/80 rounded-md"
                        >
                          <p className="text-sm text-foreground">"{text}"</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      AWS Rekognition detected{" "}
                      {image.rekognitionDetails.text.length} text{" "}
                      {image.rekognitionDetails.text.length === 1
                        ? "item"
                        : "items"}{" "}
                      in this image
                    </p>
                  </div>
                ) : (
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No text detected in this image
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                    About Text Detection
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-500">
                    AWS Rekognition can detect and extract text from images,
                    making it searchable. This is useful for documents, signs,
                    labels, and other text content in your photos.
                  </p>
                </div>

                {/* Analysis timestamp */}
                <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
                  <Clock className="h-3 w-3 mr-1" />
                  Analyzed on {formatDate(image.rekognitionDetails.analyzedAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
