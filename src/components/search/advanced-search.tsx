"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Tag,
  Users,
  MapPin,
  Text,
  Calendar,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
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

type SearchFilter = {
  type: "label" | "face" | "text" | "location" | "date";
  value: string;
  label: string;
};

export default function AdvancedSearch() {
  const { session } = useAuth();
  const token = session?.access_token;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchResults, setSearchResults] = useState<ImageMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all available metadata for filter suggestions
  const { data, error, isLoading } = useSWR(
    token ? ["/api/metadata/aggregate", token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Fetch all images
  const { data: imagesData } = useSWR(
    token ? ["/api/images", token] : null,
    ([url, token]) => fetcher(url, token),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Perform search when query or filters change
  useEffect(() => {
    if (!imagesData?.images) return;

    setIsSearching(true);

    // Debounce search to avoid too many re-renders
    const timer = setTimeout(() => {
      const results = searchImages(
        imagesData.images,
        searchQuery,
        activeFilters
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeFilters, imagesData]);

  // Search function that combines text search with filters
  const searchImages = (
    images: ImageMetadata[],
    query: string,
    filters: SearchFilter[]
  ) => {
    return images.filter((image) => {
      // Text search across multiple fields
      const matchesQuery =
        query === "" ||
        image.filename.toLowerCase().includes(query.toLowerCase()) ||
        (image.labels &&
          image.labels.some((label) =>
            label.toLowerCase().includes(query.toLowerCase())
          )) ||
        (image.rekognitionDetails?.text &&
          image.rekognitionDetails.text.some((text) =>
            text.toLowerCase().includes(query.toLowerCase())
          )) ||
        (image.location &&
          image.location.toLowerCase().includes(query.toLowerCase()));

      // Apply all filters
      const matchesFilters =
        filters.length === 0 ||
        filters.every((filter) => {
          switch (filter.type) {
            case "label":
              return image.labels && image.labels.includes(filter.value);
            case "face":
              return image.faces > 0;
            case "text":
              return (
                image.rekognitionDetails?.text &&
                image.rekognitionDetails.text.length > 0
              );
            case "location":
              return image.location === filter.value;
            case "date":
              // Simple date filter - could be enhanced for ranges
              const imageDate = new Date(
                image.lastModified
              ).toLocaleDateString();
              return imageDate === filter.value;
            default:
              return true;
          }
        });

      return matchesQuery && matchesFilters;
    });
  };

  const addFilter = (
    type: SearchFilter["type"],
    value: string,
    label: string
  ) => {
    // Don't add duplicate filters
    if (!activeFilters.some((f) => f.type === type && f.value === value)) {
      setActiveFilters([...activeFilters, { type, value, label }]);
    }
    setShowFilterMenu(false);
  };

  const removeFilter = (index: number) => {
    const newFilters = [...activeFilters];
    newFilters.splice(index, 1);
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
  };

  // Get unique values for filter suggestions
  const getFilterSuggestions = () => {
    if (!data) return { labels: [], locations: [] };

    return {
      labels: data.labels || [],
      locations: data.locations || [],
    };
  };

  const { labels, locations } = getFilterSuggestions();

  return (
    <div className="w-full">
      <div className="bg-card rounded-xl shadow-sm border border-border p-5 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
              placeholder="Search photos by content, labels, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter
                className={`h-5 w-5 ${
                  activeFilters.length > 0
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">Filters:</span>
              {activeFilters.map((filter, index) => (
                <div
                  key={`${filter.type}-${filter.value}`}
                  className="flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                >
                  {filter.type === "label" && <Tag className="h-3 w-3 mr-1" />}
                  {filter.type === "face" && <Users className="h-3 w-3 mr-1" />}
                  {filter.type === "text" && <Text className="h-3 w-3 mr-1" />}
                  {filter.type === "location" && (
                    <MapPin className="h-3 w-3 mr-1" />
                  )}
                  {filter.type === "date" && (
                    <Calendar className="h-3 w-3 mr-1" />
                  )}
                  <span>{filter.label}</span>
                  <button
                    className="ml-1 text-primary hover:text-primary/80"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter menu */}
          {showFilterMenu && (
            <div className="bg-background border border-border rounded-lg p-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Labels section */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Labels
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : labels.length > 0 ? (
                      labels.slice(0, 10).map((label: string) => (
                        <button
                          key={label}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-md"
                          onClick={() => addFilter("label", label, label)}
                        >
                          {label}
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No labels found
                      </div>
                    )}
                  </div>
                </div>

                {/* Locations section */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Locations
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {isLoading ? (
                      <div className="text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : locations.length > 0 ? (
                      locations.map((location: string) => (
                        <button
                          key={location}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-md"
                          onClick={() =>
                            addFilter("location", location, location)
                          }
                        >
                          {location}
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No locations found
                      </div>
                    )}
                  </div>
                </div>

                {/* Special filters */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    Special Filters
                  </h4>
                  <div className="space-y-1">
                    <button
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-md flex items-center"
                      onClick={() =>
                        addFilter("face", "true", "Contains People")
                      }
                    >
                      <Users className="h-4 w-4 mr-1 text-indigo-500" />
                      Contains People
                    </button>
                    <button
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded-md flex items-center"
                      onClick={() => addFilter("text", "true", "Contains Text")}
                    >
                      <Text className="h-4 w-4 mr-1 text-blue-500" />
                      Contains Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search results stats */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {isSearching ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              Searching...
            </span>
          ) : (
            `${searchResults.length} ${
              searchResults.length === 1 ? "result" : "results"
            }`
          )}
        </h3>

        {searchResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(searchResults.length, 50)} of{" "}
            {searchResults.length}
          </div>
        )}
      </div>

      {/* Results grid - simplified, you would use your existing GalleryGrid component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {searchResults.slice(0, 50).map((image) => (
          <div
            key={image.id}
            className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative aspect-square">
              <img
                src={
                  image.url ||
                  `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
                    image.filename
                  )}`
                }
                alt={image.filename}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
                    image.filename
                  )}`;
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

      {searchResults.length === 0 && !isSearching && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No results found
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}
    </div>
  );
}
