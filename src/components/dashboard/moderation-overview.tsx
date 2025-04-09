"use client";

import { ImageIcon, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Sample data for the dashboard
const moderationStats = {
  totalImages: 1248,
  pendingReview: 37,
  flaggedContent: 142,
  approvedContent: 1069,
  moderationAccuracy: 98.5,
};

// Sample recent activity
const recentActivity = [
  {
    id: 1,
    filename: "beach-vacation.jpg",
    timestamp: "2 minutes ago",
    status: "approved",
    confidence: 99.2,
  },
  {
    id: 2,
    filename: "profile-photo-3.png",
    timestamp: "15 minutes ago",
    status: "flagged",
    confidence: 87.5,
    reason: "Potential adult content",
  },
  {
    id: 3,
    filename: "marketing-banner.jpg",
    timestamp: "42 minutes ago",
    status: "approved",
    confidence: 98.7,
  },
  {
    id: 4,
    filename: "event-photo.jpg",
    timestamp: "1 hour ago",
    status: "pending",
    confidence: 65.3,
  },
  {
    id: 5,
    filename: "product-image.png",
    timestamp: "2 hours ago",
    status: "approved",
    confidence: 99.8,
  },
];

export default function ModerationOverview() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">
          Moderation Overview
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitor your content moderation metrics and recent activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Total Images
            </h3>
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {moderationStats.totalImages}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            +24 in the last 24 hours
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Pending Review
            </h3>
            <div className="p-2 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {moderationStats.pendingReview}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Requires human review
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Flagged Content
            </h3>
            <div className="p-2 bg-red-500/10 dark:bg-red-400/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {moderationStats.flaggedContent}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            11.4% of total content
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              Approved Content
            </h3>
            <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {moderationStats.approvedContent}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            85.7% of total content
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
          <button className="text-sm text-primary hover:text-primary/90 font-medium">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 border-b border-border">Filename</th>
                <th className="px-4 py-3 border-b border-border">Time</th>
                <th className="px-4 py-3 border-b border-border">Status</th>
                <th className="px-4 py-3 border-b border-border">Confidence</th>
                <th className="px-4 py-3 border-b border-border">Details</th>
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
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "approved"
                          ? "bg-green-600 text-white dark:bg-green-500"
                          : item.status === "flagged"
                          ? "bg-red-600 text-white dark:bg-red-500"
                          : "bg-yellow-600 text-white dark:bg-yellow-500"
                      }`}
                    >
                      {item.status === "approved" && (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      )}
                      {item.status === "flagged" && (
                        <AlertTriangle className="mr-1 h-3 w-3" />
                      )}
                      {item.status === "pending" && (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-muted rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            item.confidence > 90
                              ? "bg-green-500"
                              : item.confidence > 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.confidence}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {item.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {item.reason || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
