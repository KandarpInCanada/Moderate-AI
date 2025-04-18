"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/context/notifications-context";

export default function NotificationBell() {
  const { enabled, queueUrl } = useNotifications();

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {enabled && queueUrl && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
        )}
      </button>
    </div>
  );
}
