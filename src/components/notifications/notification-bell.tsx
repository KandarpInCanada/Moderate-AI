"use client";

import { useState } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotifications } from "@/context/notifications-context";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening the dropdown
      markAllAsRead();
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    // Here you could also navigate to a specific page based on the notification
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
      case "warning":
        return <div className="h-2 w-2 rounded-full bg-yellow-500"></div>;
      case "error":
        return <div className="h-2 w-2 rounded-full bg-red-500"></div>;
      case "info":
      default:
        return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for closing dropdown when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={toggleDropdown}></div>

          <div className="absolute right-0 mt-2 w-80 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-medium text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsRead();
                    }}
                    className="text-xs text-primary hover:text-primary/90 font-medium flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotifications();
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear all
                  </button>
                )}
                <button
                  onClick={toggleDropdown}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No notifications</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id)}
                      className={`p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-border">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to settings page
                  window.location.href = "/settings";
                }}
                className="w-full py-2 text-xs text-center text-primary font-medium hover:text-primary/90"
              >
                Notification Settings
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
