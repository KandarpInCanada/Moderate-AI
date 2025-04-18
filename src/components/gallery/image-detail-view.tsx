"use client";

import {
  Tag,
  Users,
  MapPin,
  Download,
  Edit,
  Text,
  Clock,
  Info,
  ImageIcon,
  Share2,
  Heart,
  X,
} from "lucide-react";
import type { ImageMetadata } from "@/types/image";
import { useState, useEffect, useRef } from "react";
import { refreshImageUrl } from "@/lib/s3-client";
import { motion, AnimatePresence } from "framer-motion";

interface ImageDetailViewProps {
  image: ImageMetadata;
  onClose: () => void;
  isOpen: boolean;
}

export default function ImageDetailView({
  image,
  onClose,
  isOpen,
}: ImageDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"info" | "labels" | "text">(
    "info"
  );
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset image error state when image changes
    setImageError(false);
    setIsImageLoading(true);
  }, [image]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Handle escape key to close
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
      // Restore body scrolling when modal is closed
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-card rounded-xl shadow-xl border border-border w-full max-w-6xl max-h-[90vh] overflow-hidden"
          >
            {/* Modal header with close button */}
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground truncate">
                {image.filename}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row max-h-[calc(90vh-4rem)] overflow-hidden">
              {/* Image section - fixed size container */}
              <div className="lg:w-3/5 bg-muted flex items-center justify-center p-0 h-[500px] overflow-hidden relative">
                <div
                  className={`w-full h-full flex items-center justify-center relative ${
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                >
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
                      <motion.img
                        src={image.url || getPlaceholderUrl()}
                        alt={image.filename}
                        className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                          isImageLoading ? "opacity-0" : "opacity-100"
                        }`}
                        animate={{
                          scale: isZoomed ? 1.5 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        onLoad={() => setIsImageLoading(false)}
                        onLoadStart={() => setIsImageLoading(true)}
                        onError={async (e) => {
                          // Try to refresh the URL if it's a 403 error (likely expired pre-signed URL)
                          if (image.key && image.url) {
                            try {
                              // Only attempt to refresh if we have the necessary data
                              const refreshedUrl = await refreshImageUrl(
                                image.key
                              );
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
                        onClick={async (e) => {
                          e.stopPropagation(); // Prevent zoom toggle
                          if (image.key) {
                            try {
                              setIsImageLoading(true);
                              const refreshedUrl = await refreshImageUrl(
                                image.key
                              );
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

                {/* Image controls overlay */}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(!isLiked);
                    }}
                    className={`p-2 rounded-full ${
                      isLiked
                        ? "bg-red-500 text-white"
                        : "bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${isLiked ? "fill-white" : ""}`}
                    />
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    href={image.url}
                    download={image.filename}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                  >
                    <Download className="h-5 w-5" />
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share functionality
                      if (navigator.share) {
                        navigator
                          .share({
                            title: image.filename,
                            text: `Check out this image: ${image.filename}`,
                            url: image.url,
                          })
                          .catch((err) => console.error("Error sharing:", err));
                      }
                    }}
                    className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
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

                <AnimatePresence mode="wait">
                  {activeTab === "info" && (
                    <motion.div
                      key="info"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
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
                          <span className="text-sm text-muted-foreground">
                            Size
                          </span>
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
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/30"
                          >
                            <Users className="h-4 w-4 mr-1" />
                            {image.faces}{" "}
                            {image.faces === 1 ? "Person" : "People"}
                          </motion.span>
                        )}
                        {image.location && (
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30"
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            {image.location}
                          </motion.span>
                        )}
                        {image.rekognitionDetails.text &&
                          image.rekognitionDetails.text.length > 0 && (
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30"
                            >
                              <Text className="h-4 w-4 mr-1" />
                              Text Detected
                            </motion.span>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <motion.a
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          href={image.url}
                          download={image.filename}
                          className="flex-1 flex justify-center items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90"
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          Edit Labels
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "labels" && (
                    <motion.div
                      key="labels"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        AI-Detected Labels
                      </h3>

                      {/* Labels with confidence */}
                      {image.rekognitionDetails.labels &&
                      image.rekognitionDetails.labels.length > 0 ? (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="grid grid-cols-1 gap-3">
                            {image.rekognitionDetails.labels.map(
                              (label, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: index * 0.05,
                                  }}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center">
                                    <Tag className="h-4 w-4 text-primary mr-2" />
                                    <span className="text-sm font-medium text-foreground">
                                      {label.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="w-24 bg-muted rounded-full h-1.5 mr-2 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                          width: `${label.confidence}%`,
                                        }}
                                        transition={{
                                          duration: 0.8,
                                          delay: 0.2 + index * 0.05,
                                        }}
                                        className="h-1.5 rounded-full bg-primary"
                                      ></motion.div>
                                    </div>
                                    <span className="text-xs text-foreground">
                                      {label.confidence.toFixed(1)}%
                                    </span>
                                  </div>
                                </motion.div>
                              )
                            )}
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
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="bg-muted/50 rounded-lg p-4"
                        >
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
                        </motion.div>
                      )}

                      {/* Celebrities */}
                      {image.rekognitionDetails.celebrities &&
                        image.rekognitionDetails.celebrities.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="bg-muted/50 rounded-lg p-4"
                          >
                            <h4 className="text-sm font-medium text-foreground mb-3">
                              Celebrities Recognized
                            </h4>
                            <div className="space-y-2">
                              {image.rekognitionDetails.celebrities.map(
                                (celebrity, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: 0.3 + index * 0.05,
                                    }}
                                    className="flex items-center justify-between"
                                  >
                                    <span className="text-sm text-foreground">
                                      {celebrity.name}
                                    </span>
                                    <span className="text-xs text-foreground">
                                      {celebrity.confidence.toFixed(1)}%
                                      confidence
                                    </span>
                                  </motion.div>
                                )
                              )}
                            </div>
                          </motion.div>
                        )}

                      {/* Analysis timestamp */}
                      <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
                        <Clock className="h-3 w-3 mr-1" />
                        Analyzed on{" "}
                        {formatDate(image.rekognitionDetails.analyzedAt)}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "text" && (
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Detected Text
                      </h3>

                      {image.rekognitionDetails.text &&
                      image.rekognitionDetails.text.length > 0 ? (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="space-y-3">
                            {image.rekognitionDetails.text.map(
                              (text, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: index * 0.05,
                                  }}
                                  className="p-3 bg-background/80 rounded-md"
                                >
                                  <p className="text-sm text-foreground">
                                    "{text}"
                                  </p>
                                </motion.div>
                              )
                            )}
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

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4"
                      >
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                          About Text Detection
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-500">
                          AWS Rekognition can detect and extract text from
                          images, making it searchable. This is useful for
                          documents, signs, labels, and other text content in
                          your photos.
                        </p>
                      </motion.div>

                      {/* Analysis timestamp */}
                      <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
                        <Clock className="h-3 w-3 mr-1" />
                        Analyzed on{" "}
                        {formatDate(image.rekognitionDetails.analyzedAt)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
