"use client";

import { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";

export default function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, session } = useAuth();
  const { enabled, queueUrl, pollForMessages } = useNotifications();

  // Fetch notifications when dropdown is opened
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

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
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

  // Poll for new notifications when component mounts
  useEffect(() => {
    if (enabled && user) {
      pollForMessages();
    }
  }, [enabled, user, pollForMessages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('[data-dropdown="notifications"]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" data-dropdown="notifications">
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {enabled && queueUrl && notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-card rounded-lg shadow-lg border border-border z-[100]"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-card z-10">
            <h3 className="font-medium text-foreground">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">
                  Loading notifications...
                </p>
              </div>
            ) : error ? (
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
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Refresh
                </button>
              </div>
            ) : (
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
                            onClick={() =>
                              deleteNotification(notification.receiptHandle)
                            }
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
                                src={
                                  notification.imageUrl || "/placeholder.svg"
                                }
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
