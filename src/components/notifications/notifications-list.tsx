"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, Trash2, Bell } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";

export default function NotificationsList() {
  const { user, session } = useAuth();
  const { notifications, setNotifications, pollForMessages } =
    useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user || !session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  // Delete a notification
  const deleteNotification = async (receiptHandle: string) => {
    if (!user || !session?.access_token) return;

    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ receiptHandle }),
      });

      // Remove from local state
      setNotifications(
        notifications.filter((n) => n.receiptHandle !== receiptHandle)
      );
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
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

  if (loading) {
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
        <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
        <button
          onClick={fetchNotifications}
          className="mt-2 text-xs text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="p-4 border-b border-border hover:bg-muted/50"
        >
          <div className="flex">
            <div className="mr-3 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-foreground">
                  {notification.title}
                </h4>
                <button
                  onClick={() => deleteNotification(notification.receiptHandle)}
                  className="text-muted-foreground hover:text-foreground ml-2"
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
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
                    />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="p-3 text-center border-t border-border">
        <button
          onClick={fetchNotifications}
          className="text-xs text-primary hover:underline"
        >
          Refresh notifications
        </button>
      </div>
    </div>
  );
}
