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
    pollForMessages,
    hasUnreadNotifications,
    setHasUnreadNotifications,
  } = useNotifications();

  // Poll for notifications when component mounts
  useEffect(() => {
    if (enabled) {
      pollForMessages();

      // Set up polling interval
      const interval = setInterval(() => {
        pollForMessages();
      }, 60000); // Poll every minute

      return () => clearInterval(interval);
    }
  }, [enabled, pollForMessages]);

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
