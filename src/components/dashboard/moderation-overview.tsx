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
        <h2 className="text-2xl font-bold text-gray-900">
          Moderation Overview
        </h2>
        <p className="text-gray-600 mt-1">
          Monitor your content moderation metrics and recent activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Images</h3>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {moderationStats.totalImages}
          </p>
          <p className="text-sm text-gray-500 mt-2">+24 in the last 24 hours</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">
              Pending Review
            </h3>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {moderationStats.pendingReview}
          </p>
          <p className="text-sm text-gray-500 mt-2">Requires human review</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">
              Flagged Content
            </h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {moderationStats.flaggedContent}
          </p>
          <p className="text-sm text-gray-500 mt-2">11.4% of total content</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">
              Approved Content
            </h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {moderationStats.approvedContent}
          </p>
          <p className="text-sm text-gray-500 mt-2">85.7% of total content</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 border-b border-gray-200">Filename</th>
                <th className="px-4 py-3 border-b border-gray-200">Time</th>
                <th className="px-4 py-3 border-b border-gray-200">Status</th>
                <th className="px-4 py-3 border-b border-gray-200">
                  Confidence
                </th>
                <th className="px-4 py-3 border-b border-gray-200">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivity.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.filename}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-500">{item.timestamp}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : item.status === "flagged"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
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
                      <div className="w-16 bg-gray-200 rounded-full h-2.5">
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
                      <span className="ml-2 text-xs text-gray-500">
                        {item.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
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
