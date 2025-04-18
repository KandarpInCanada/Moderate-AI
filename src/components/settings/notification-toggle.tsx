"use client";

import { useNotifications } from "@/context/notifications-context";
import { Bell, BellOff } from "lucide-react";

export default function NotificationToggle() {
  const { enabled, setEnabled } = useNotifications();

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center">
        {enabled ? (
          <Bell className="h-5 w-5 text-primary mr-3" />
        ) : (
          <BellOff className="h-5 w-5 text-muted-foreground mr-3" />
        )}
        <div>
          <h4 className="text-sm font-medium text-foreground">
            Notification Alerts
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {enabled
              ? "You will receive notifications about image processing and system updates"
              : "Notifications are currently disabled"}
          </p>
        </div>
      </div>

      {/* Tailwind toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle notifications"
        onClick={() => setEnabled(!enabled)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
          transition-colors duration-200 ease-in-out focus:outline-none
          ${
            enabled
              ? "bg-primary border-primary"
              : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          }
        `}
      >
        <span className="sr-only">Toggle notifications</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg 
            ring-0 transition duration-200 ease-in-out
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}
