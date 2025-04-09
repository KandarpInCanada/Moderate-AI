"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  Users,
  MapPin,
  Eye,
  Download,
  MoreHorizontal,
  Search,
} from "lucide-react";
import type { ModerationStatus } from "./gallery-container";
import ImageDetailModal from "./image-detail-modal";

// Create a helper function to generate placeholder URLs
const getPlaceholderUrl = (query: string, width = 800, height = 600) => {
  return `https://placehold.co/${width}x${height}/EEEEEE/999999?text=${encodeURIComponent(
    query
  )}`;
};

const sampleImages = [
  {
    id: "img1",
    filename: "beach-vacation.jpg",
    uploadDate: "2025-04-05T14:30:00Z",
    labels: ["Beach", "Ocean", "Sunset", "Vacation"],
    faces: 2,
    location: "Miami Beach, FL",
    confidence: 99.2,
    url: getPlaceholderUrl("Tropical Beach Paradise"),
    size: "2.4 MB",
    dimensions: "1920 x 1080",
    rekognitionDetails: {
      labels: [
        { name: "Beach", confidence: 99.2 },
        { name: "Ocean", confidence: 98.7 },
        { name: "Sunset", confidence: 97.5 },
        { name: "Vacation", confidence: 95.1 },
        { name: "Sand", confidence: 94.8 },
        { name: "Coast", confidence: 93.2 },
      ],
      faces: 2,
      celebrities: [],
      text: [],
      analyzedAt: "2025-04-05T14:35:00Z",
    },
  },
  {
    id: "img2",
    filename: "family-photo.png",
    uploadDate: "2025-04-04T10:15:00Z",
    labels: ["People", "Family", "Indoor", "Living Room"],
    faces: 4,
    location: "Home",
    confidence: 97.5,
    url: getPlaceholderUrl("Family Photo"),
    size: "1.8 MB",
    dimensions: "1200 x 1200",
    rekognitionDetails: {
      labels: [
        { name: "People", confidence: 99.8 },
        { name: "Family", confidence: 97.5 },
        { name: "Indoor", confidence: 98.9 },
        { name: "Living Room", confidence: 95.3 },
        { name: "Furniture", confidence: 94.1 },
      ],
      faces: 4,
      celebrities: [],
      text: [],
      analyzedAt: "2025-04-04T10:20:00Z",
    },
  },
  {
    id: "img3",
    filename: "city-skyline.jpg",
    uploadDate: "2025-04-03T16:45:00Z",
    labels: ["City", "Skyline", "Building", "Architecture"],
    faces: 0,
    location: "New York, NY",
    confidence: 98.7,
    url: getPlaceholderUrl("City Skyline"),
    size: "3.2 MB",
    dimensions: "2560 x 1440",
    rekognitionDetails: {
      labels: [
        { name: "City", confidence: 99.5 },
        { name: "Skyline", confidence: 98.7 },
        { name: "Building", confidence: 98.2 },
        { name: "Architecture", confidence: 97.9 },
        { name: "Urban", confidence: 97.1 },
        { name: "Skyscraper", confidence: 96.8 },
      ],
      faces: 0,
      celebrities: [],
      text: ["EMPIRE STATE"],
      analyzedAt: "2025-04-03T16:50:00Z",
    },
  },
  {
    id: "img4",
    filename: "pet-dog.jpg",
    uploadDate: "2025-04-03T09:20:00Z",
    labels: ["Dog", "Pet", "Animal", "Grass", "Outdoor"],
    faces: 0,
    location: "Backyard",
    confidence: 99.3,
    url: getPlaceholderUrl("Pet Dog"),
    size: "4.1 MB",
    dimensions: "3840 x 2160",
    rekognitionDetails: {
      labels: [
        { name: "Dog", confidence: 99.3 },
        { name: "Pet", confidence: 98.7 },
        { name: "Animal", confidence: 98.5 },
        { name: "Grass", confidence: 97.2 },
        { name: "Outdoor", confidence: 96.8 },
        { name: "Mammal", confidence: 96.5 },
      ],
      faces: 0,
      celebrities: [],
      text: [],
      analyzedAt: "2025-04-03T09:25:00Z",
    },
  },
  {
    id: "img5",
    filename: "concert-event.png",
    uploadDate: "2025-04-02T13:10:00Z",
    labels: ["Concert", "Music", "Crowd", "Stage", "Performance"],
    faces: 12,
    location: "Madison Square Garden",
    confidence: 96.8,
    url: getPlaceholderUrl("Concert Event"),
    size: "1.5 MB",
    dimensions: "1500 x 1500",
    rekognitionDetails: {
      labels: [
        { name: "Concert", confidence: 96.8 },
        { name: "Music", confidence: 96.5 },
        { name: "Crowd", confidence: 95.9 },
        { name: "Stage", confidence: 95.2 },
        { name: "Performance", confidence: 94.8 },
        { name: "Entertainment", confidence: 94.1 },
      ],
      faces: 12,
      celebrities: [{ name: "Taylor Swift", confidence: 98.7 }],
      text: ["WORLD TOUR 2025"],
      analyzedAt: "2025-04-02T13:15:00Z",
    },
  },
  {
    id: "img6",
    filename: "mountain-hike.jpg",
    uploadDate: "2025-04-01T18:30:00Z",
    labels: ["Mountain", "Hiking", "Nature", "Landscape", "Outdoor"],
    faces: 1,
    location: "Rocky Mountains, CO",
    confidence: 97.9,
    url: getPlaceholderUrl("Mountain Hiking"),
    size: "2.8 MB",
    dimensions: "2048 x 1536",
    rekognitionDetails: {
      labels: [
        { name: "Mountain", confidence: 99.1 },
        { name: "Hiking", confidence: 97.9 },
        { name: "Nature", confidence: 98.5 },
        { name: "Landscape", confidence: 98.2 },
        { name: "Outdoor", confidence: 97.8 },
        { name: "Trail", confidence: 96.3 },
      ],
      faces: 1,
      celebrities: [],
      text: [],
      analyzedAt: "2025-04-01T18:35:00Z",
    },
  },
  {
    id: "img7",
    filename: "restaurant-food.png",
    uploadDate: "2025-03-31T11:45:00Z",
    labels: ["Food", "Restaurant", "Meal", "Plate", "Dining"],
    faces: 0,
    location: "Italian Restaurant",
    confidence: 98.1,
    url: getPlaceholderUrl("Restaurant Food"),
    size: "0.9 MB",
    dimensions: "1920 x 1080",
    rekognitionDetails: {
      labels: [
        { name: "Food", confidence: 99.4 },
        { name: "Restaurant", confidence: 98.1 },
        { name: "Meal", confidence: 97.8 },
        { name: "Plate", confidence: 97.5 },
        { name: "Dining", confidence: 96.9 },
        { name: "Pasta", confidence: 96.2 },
      ],
      faces: 0,
      celebrities: [],
      text: ["BUON APPETITO"],
      analyzedAt: "2025-03-31T11:50:00Z",
    },
  },
  {
    id: "img8",
    filename: "historic-landmark.jpg",
    uploadDate: "2025-03-30T14:20:00Z",
    labels: ["Landmark", "Historic", "Architecture", "Tourism", "Travel"],
    faces: 0,
    location: "Rome, Italy",
    confidence: 99.5,
    url: getPlaceholderUrl("Historic Landmark"),
    size: "3.5 MB",
    dimensions: "3000 x 2000",
    rekognitionDetails: {
      labels: [
        { name: "Landmark", confidence: 99.5 },
        { name: "Historic", confidence: 99.2 },
        { name: "Architecture", confidence: 98.7 },
        { name: "Tourism", confidence: 97.5 },
        { name: "Travel", confidence: 97.1 },
        { name: "Colosseum", confidence: 96.8 },
      ],
      faces: 0,
      celebrities: [],
      text: ["COLOSSEUM"],
      analyzedAt: "2025-03-30T14:25:00Z",
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
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to indicate when component is mounted on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Only filter and sort images on the client side
  const filteredImages = isClient
    ? sampleImages.filter((image) => {
        // Filter based on the selected category
        let matchesFilter = true;
        if (activeFilter === "approved") {
          // "approved" is now "People" filter
          matchesFilter = image.faces > 0;
        } else if (activeFilter === "flagged") {
          // "flagged" is now "Objects" filter
          matchesFilter = image.labels.some(
            (label) => !["People", "Person", "Human", "Face"].includes(label)
          );
        } else if (activeFilter === "pending") {
          // "pending" is now "Places" filter
          matchesFilter = image.location !== "";
        }

        // Search in filename, labels, and location
        const matchesSearch =
          image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          image.labels.some((label) =>
            label.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          (image.location &&
            image.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (image.rekognitionDetails.text &&
            image.rekognitionDetails.text.some((text) =>
              text.toLowerCase().includes(searchQuery.toLowerCase())
            ));

        return matchesFilter && matchesSearch;
      })
    : [];

  const sortedImages = isClient
    ? [...filteredImages].sort((a, b) => {
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
      })
    : [];

  const toggleDropdown = (id: string) => {
    setShowDropdownId(showDropdownId === id ? null : id);
  };

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
    return `${month} ${date.getDate()}, ${date.getFullYear()}`;
  };
  const getStatusIcon = (image: (typeof sampleImages)[0]) => {
    if (image.faces > 0) {
      return <Users className="h-4 w-4" />;
    } else if (
      image.rekognitionDetails.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return <Search className="h-4 w-4" />;
    } else {
      return <Tag className="h-4 w-4" />;
    }
  };

  const getStatusClass = (image: (typeof sampleImages)[0]) => {
    if (image.faces > 0) {
      return "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white border-indigo-700 dark:border-indigo-600";
    } else if (
      image.rekognitionDetails.text &&
      image.rekognitionDetails.text.length > 0
    ) {
      return "bg-green-600 text-white dark:bg-green-500 dark:text-white border-green-700 dark:border-green-600";
    } else {
      return "bg-purple-600 text-white dark:bg-purple-500 dark:text-white border-purple-700 dark:border-purple-600";
    }
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

  return (
    <>
      {sortedImages.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No photos found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeFilter !== "all"
              ? `No ${
                  activeFilter === "approved"
                    ? "people"
                    : activeFilter === "flagged"
                    ? "objects"
                    : "places"
                } found in your photos. Try changing your filter or uploading new images.`
              : searchQuery
              ? "No photos match your search. Try a different search term."
              : "You haven't uploaded any photos yet. Upload some photos to see them here."}
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
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.filename}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
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
                      image
                    )}`}
                  >
                    {getStatusIcon(image)}
                    <span className="ml-1">
                      {image.faces > 0
                        ? `${image.faces} ${
                            image.faces === 1 ? "Person" : "People"
                          }`
                        : image.rekognitionDetails.text &&
                          image.rekognitionDetails.text.length > 0
                        ? "Text"
                        : "Object"}
                    </span>
                  </span>
                </div>
                {image.location && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black/60 text-white border border-white/20">
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
                            <Tag className="h-4 w-4 mr-2" />
                            Edit Labels
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(image.uploadDate)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {image.labels.slice(0, 3).map((label, index) => (
                    <span
                      key={index}
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
