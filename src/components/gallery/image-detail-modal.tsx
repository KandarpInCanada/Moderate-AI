"use client";

import { AlertTriangle, CheckCircle, Clock, Download, X } from "lucide-react";
import Image from "next/image";

interface ImageDetailModalProps {
  image: {
    id: string;
    filename: string;
    uploadDate: string;
    status: string;
    confidence: number;
    url: string;
    size: string;
    dimensions: string;
    moderationDetails: {
      categories: {
        violence: number;
        adult: number;
        sensitive: number;
      };
      reason?: string;
      moderatedAt?: string;
    };
  };
  onClose: () => void;
}

export default function ImageDetailModal({
  image,
  onClose,
}: ImageDetailModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "flagged":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
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
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image section */}
        <div className="md:w-3/5 bg-muted relative flex items-center justify-center">
          <Image
            src={image.url || "/placeholder.svg"}
            alt={image.filename}
            width={800}
            height={800}
            className="max-h-[50vh] md:max-h-[90vh] object-contain"
          />
        </div>

        {/* Details section */}
        <div className="md:w-2/5 p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2
              className="text-xl font-semibold text-foreground truncate pr-6"
              title={image.filename}
            >
              {image.filename}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium border ${getStatusClass(
                image.status
              )}`}
            >
              {getStatusIcon(image.status)}
              <span className="ml-1 capitalize">{image.status}</span>
            </span>
          </div>

          <div className="space-y-6">
            {/* Basic info */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Image Information
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Uploaded
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(image.uploadDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Size</span>
                  <span className="text-sm font-medium text-foreground">
                    {image.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Dimensions
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {image.dimensions}
                  </span>
                </div>
                {image.moderationDetails.moderatedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Moderated
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(image.moderationDetails.moderatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Moderation details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Moderation Details
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Confidence
                  </span>
                  <div className="flex items-center">
                    <div className="w-24 bg-muted rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          image.confidence > 90
                            ? "bg-green-500"
                            : image.confidence > 70
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${image.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {image.confidence}%
                    </span>
                  </div>
                </div>

                {/* Category scores */}
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Category Scores:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Violence</span>
                        <span className="text-foreground">
                          {(
                            image.moderationDetails.categories.violence * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-red-500"
                          style={{
                            width: `${
                              image.moderationDetails.categories.violence * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Adult Content
                        </span>
                        <span className="text-foreground">
                          {(
                            image.moderationDetails.categories.adult * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-orange-500"
                          style={{
                            width: `${
                              image.moderationDetails.categories.adult * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          Sensitive Content
                        </span>
                        <span className="text-foreground">
                          {(
                            image.moderationDetails.categories.sensitive * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-yellow-500"
                          style={{
                            width: `${
                              image.moderationDetails.categories.sensitive * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason if flagged */}
                {image.moderationDetails.reason && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">Reason:</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-1">
                      {image.moderationDetails.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-3">
            <button className="flex-1 flex justify-center items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted">
              <Download className="h-5 w-5 mr-2" />
              Download
            </button>
            <button className="flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90">
              Request Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
