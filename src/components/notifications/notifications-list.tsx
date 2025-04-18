"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";

export default function NotificationsList() {
  const { user, session } = useAuth();
  const {
    notifications,
    fetchNotifications,
    deleteNotification,
    markAllAsRead,
    isPolling,
  } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications on mount and mark as read
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        await fetchNotifications();
        markAllAsRead();
      } catch (err: any) {
        setError(err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [fetchNotifications, markAllAsRead]);

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
        );
      case "error":
        return (
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
        );
      default:
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchNotifications();
    } catch (err: any) {
      setError(err.message || "Failed to refresh notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (
    receiptHandle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteNotification(receiptHandle);
    } catch (err: any) {
      console.error("Failed to delete notification:", err);
    }
  };

  if (loading || isPolling) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">
          Loading notifications...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
        <button
          onClick={handleRefresh}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-4 border-b border-border hover:bg-muted/50"
          >
            <div className="flex">
              <div className="mr-3 mt-0.5 flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-foreground truncate pr-2">
                    {notification.title}
                  </h4>
                  <button
                    onClick={(e) =>
                      handleDeleteNotification(notification.receiptHandle, e)
                    }
                    className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-words">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(notification.timestamp)}
                </p>

                {notification.imageUrl && (
                  <div className="mt-2">
                    <a
                      href={notification.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-20 bg-muted rounded-md overflow-hidden"
                    >
                      <img
                        src={notification.imageUrl || "/placeholder.svg"}
                        alt="Notification image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=80&width=300&text=Image+unavailable";
                        }}
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 text-center border-t border-border">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center text-xs text-primary hover:underline"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh notifications
        </button>
      </div>
    </div>
  );
}
