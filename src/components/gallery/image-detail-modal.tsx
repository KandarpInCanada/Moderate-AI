"use client";

import { Tag, Users, MapPin, Download, X, Search } from "lucide-react";

interface ImageDetailModalProps {
  image: {
    id: string;
    filename: string;
    uploadDate: string;
    labels: string[];
    faces: number;
    location: string;
    confidence: number;
    url: string;
    size: string;
    dimensions: string;
    rekognitionDetails: {
      labels: Array<{ name: string; confidence: number }>;
      faces: number;
      celebrities: Array<{ name: string; confidence: number }>;
      text: string[];
      analyzedAt: string;
    };
  };
  onClose: () => void;
}

export default function ImageDetailModal({
  image,
  onClose,
}: ImageDetailModalProps) {
  const formatDate = (dateString: string) => {
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
          <img
            src={image.url || "/placeholder.svg"}
            alt={image.filename}
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

          <div className="mb-6 flex flex-wrap gap-2">
            {image.faces > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/30">
                <Users className="h-4 w-4 mr-1" />
                {image.faces} {image.faces === 1 ? "Person" : "People"}
              </span>
            )}
            {image.location && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30">
                <MapPin className="h-4 w-4 mr-1" />
                {image.location}
              </span>
            )}
            {image.rekognitionDetails.text &&
              image.rekognitionDetails.text.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/30">
                  <Search className="h-4 w-4 mr-1" />
                  Text Detected
                </span>
              )}
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Analyzed
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(image.rekognitionDetails.analyzedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* AWS Rekognition details */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                AWS Rekognition Analysis
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                {/* Labels */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Labels
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {image.rekognitionDetails.labels.length} detected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {image.rekognitionDetails.labels.map((label, index) => (
                      <div key={index} className="group relative">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                          <Tag className="h-3 w-3 mr-1" />
                          {label.name}
                        </span>
                        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          {label.confidence.toFixed(1)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Faces */}
                {image.rekognitionDetails.faces > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        Faces
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {image.rekognitionDetails.faces} detected
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-2">
                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm text-foreground">
                        {image.rekognitionDetails.faces}{" "}
                        {image.rekognitionDetails.faces === 1
                          ? "person"
                          : "people"}{" "}
                        detected in this image
                      </span>
                    </div>
                  </div>
                )}

                {/* Celebrities */}
                {image.rekognitionDetails.celebrities &&
                  image.rekognitionDetails.celebrities.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Celebrities
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {image.rekognitionDetails.celebrities.length}{" "}
                          recognized
                        </span>
                      </div>
                      {image.rekognitionDetails.celebrities.map(
                        (celebrity, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-foreground">
                              {celebrity.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {celebrity.confidence.toFixed(1)}% confidence
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {/* Text */}
                {image.rekognitionDetails.text &&
                  image.rekognitionDetails.text.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Text Detected
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {image.rekognitionDetails.text.length} items
                        </span>
                      </div>
                      <div className="bg-background/50 p-2 rounded-md">
                        {image.rekognitionDetails.text.map((text, index) => (
                          <div key={index} className="text-sm text-foreground">
                            "{text}"
                          </div>
                        ))}
                      </div>
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
              <Tag className="h-5 w-5 mr-2" />
              Edit Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
