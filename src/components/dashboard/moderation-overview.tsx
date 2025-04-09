"use client";

import { ImageIcon, Tag, Users, Search, Calendar } from "lucide-react";

// Sample data for the dashboard
const photoStats = {
  totalImages: 1248,
  peopleDetected: 837,
  objectsLabeled: 3542,
  textDetected: 215,
  lastUpload: "2 hours ago",
};

// Sample recent activity
const recentActivity = [
  {
    id: 1,
    filename: "family-vacation.jpg",
    timestamp: "2 minutes ago",
    labels: ["People", "Beach", "Ocean", "Sunset"],
    faces: 4,
    confidence: 99.2,
  },
  {
    id: 2,
    filename: "office-meeting.png",
    timestamp: "15 minutes ago",
    labels: ["People", "Office", "Business", "Indoor"],
    faces: 6,
    confidence: 97.5,
  },
  {
    id: 3,
    filename: "city-skyline.jpg",
    timestamp: "42 minutes ago",
    labels: ["City", "Building", "Architecture", "Sky"],
    faces: 0,
    confidence: 98.7,
  },
  {
    id: 4,
    filename: "pet-dog.jpg",
    timestamp: "1 hour ago",
    labels: ["Dog", "Pet", "Animal", "Grass"],
    faces: 0,
    confidence: 99.3,
  },
  {
    id: 5,
    filename: "birthday-party.png",
    timestamp: "2 hours ago",
    labels: ["People", "Cake", "Celebration", "Indoor"],
    faces: 8,
    confidence: 96.8,
  },
];

// Sample top categories
const topCategories = [
  { name: "People", count: 423 },
  { name: "Nature", count: 287 },
  { name: "Buildings", count: 156 },
  { name: "Animals", count: 132 },
  { name: "Food", count: 98 },
  { name: "Vehicles", count: 76 },
];

export default function ModerationOverview() {
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
                        {item.labels.map((label, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {label}
                          </span>
                        ))}
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
                          {item.confidence}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
