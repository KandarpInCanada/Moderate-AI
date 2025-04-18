"use client";
import NotificationToggle from "./notification-toggle";
import { useNotifications } from "@/context/notifications-context";

export default function NotificationSettings() {
  const { notifications, clearNotifications } = useNotifications();

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Notification Settings
      </h3>

      <div className="space-y-6">
        {/* Global notification toggle */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Global Settings
          </h4>
          <NotificationToggle />
        </div>

        {/* Notification history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Notification History
            </h4>
            {notifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-xs text-primary hover:text-primary/90"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg overflow-hidden">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border-b border-border last:border-0"
                  >
                    <h5 className="text-sm font-medium text-foreground">
                      {notification.title}
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info about notifications */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
            About In-App Notifications
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-500">
            When you upload images to PhotoSense, they are automatically
            analyzed by AWS Rekognition to detect objects, faces, text, and
            more. You'll receive in-app notifications when this analysis is
            complete, including details about what was detected in your images.
          </p>
        </div>
      </div>
    </div>
  );
}
