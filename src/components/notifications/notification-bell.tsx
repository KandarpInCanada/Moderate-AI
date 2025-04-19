"use client";

import { useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/context/notifications-context";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const router = useRouter();
  const {
    enabled,
    notifications,
    fetchNotifications,
    hasUnreadNotifications,
    setHasUnreadNotifications,
  } = useNotifications();

  // Fetch notifications periodically
  useEffect(() => {
    if (enabled) {
      // Initial fetch
      fetchNotifications();

      // Set up periodic fetch (less frequent than polling)
      const interval = setInterval(() => {
        fetchNotifications();
      }, 300000); // Check every 5 minutes instead of every minute

      return () => clearInterval(interval);
    }
  }, [enabled, fetchNotifications]);

  const handleOpenNotifications = () => {
    // Mark notifications as read when opening the notifications page
    setHasUnreadNotifications(false);
    router.push("/notifications");
  };

  return (
    <button
      onClick={handleOpenNotifications}
      className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {enabled && hasUnreadNotifications && (
        <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
      )}
    </button>
  );
}
