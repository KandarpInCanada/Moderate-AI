"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Tag, Users, Search, Calendar } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import type { ImageMetadata } from "@/types/image";

export default function ModerationOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoStats, setPhotoStats] = useState({
    totalImages: 0,
    peopleDetected: 0,
    objectsLabeled: 0,
    textDetected: 0,
    lastUpload: "N/A",
  });
  const [topCategories, setTopCategories] = useState<
    { name: string; count: number }[]
  >([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const { user, session } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !session?.access_token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/images", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch images: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const images: ImageMetadata[] = data.images || [];

        // Process statistics
        processImageStats(images);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, session]);

  const processImageStats = (images: ImageMetadata[]) => {
    if (!images.length) return;

    // Calculate basic stats
    const totalImages = images.length;

    // Count people (faces)
    const peopleDetected = images.reduce(
      (sum, img) => sum + (img.faces || 0),
      0
    );

    // Count all labels
    const allLabels: string[] = [];
    const labelCounts: Record<string, number> = {};

    // Count text detected images
    const textDetected = images.filter(
      (img) =>
        img.rekognitionDetails?.text && img.rekognitionDetails.text.length > 0
    ).length;

    // Process all labels and count occurrences
    images.forEach((img) => {
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
      }));

    // Find last upload time
    const lastUpload = recent.length > 0 ? recent[0].timestamp : "N/A";

    // Update state
    setPhotoStats({
      totalImages,
      peopleDetected,
      objectsLabeled: allLabels.length,
      textDetected,
      lastUpload,
    });

    setTopCategories(topCats);
    setRecentActivity(recent);
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

  if (loading) {
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
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
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
          <p className="text-red-700 dark:text-red-500">{error}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            <div className="space-y-4">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3 border-b border-border">Photo</th>
                    <th className="px-4 py-3 border-b border-border">Time</th>
                    <th className="px-4 py-3 border-b border-border">Labels</th>
                    <th className="px-4 py-3 border-b border-border">Faces</th>
                    <th className="px-4 py-3 border-b border-border">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentActivity.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-foreground">
                              {item.filename}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="text-sm text-muted-foreground">
                          {item.timestamp}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.labels
                            .slice(0, 3)
                            .map((label: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                              >
                                {label}
                              </span>
                            ))}
                          {item.labels.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              +{item.labels.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <Users className="mr-1 h-3 w-3" />
                          {item.faces}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-muted rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full bg-green-500"
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

      {/* Calendar View Teaser */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Photo Timeline
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              View your photos organized by date
            </p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Open Timeline
          </button>
        </div>

        <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-lg bg-muted/50">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-foreground font-medium mb-2">
              Chronological Photo View
            </h4>
            <p className="text-sm text-muted-foreground max-w-md">
              Browse your photos organized by year, month, and day. AWS
              Rekognition automatically detects dates from your images.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
