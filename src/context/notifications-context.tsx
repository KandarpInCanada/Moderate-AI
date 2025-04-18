"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "success" | "info" | "warning" | "error";
  imageId?: string;
  imageUrl?: string;
}

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
};

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  enabled: true,
  setEnabled: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  addNotification: () => {},
});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);
  const { user, session } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (user) {
      const storedNotifications = localStorage.getItem(
        `photosense-notifications-${user.id}`
      );
      const storedEnabled = localStorage.getItem(
        `photosense-notifications-enabled-${user.id}`
      );

      if (storedNotifications) {
        try {
          setNotifications(JSON.parse(storedNotifications));
        } catch (error) {
          console.error("Failed to parse stored notifications:", error);
        }
      }

      if (storedEnabled !== null) {
        setEnabled(storedEnabled === "true");
      }
    }
  }, [user]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `photosense-notifications-${user.id}`,
        JSON.stringify(notifications)
      );
    }
  }, [notifications, user]);

  // Save enabled state to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `photosense-notifications-enabled-${user.id}`,
        enabled.toString()
      );
    }
  }, [enabled, user]);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !session?.access_token || !enabled) return;

      try {
        // This would be replaced with an actual API call in production
        // For now, we'll simulate some notifications for demo purposes
        const demoNotifications: Notification[] = [
          {
            id: "1",
            title: "Image Analysis Complete",
            message:
              "Your recent upload 'family-vacation.jpg' has been analyzed. 4 people detected.",
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            read: false,
            type: "success",
            imageId: "users/john_doe_gmail_com/family-vacation.jpg",
          },
          {
            id: "2",
            title: "New Features Available",
            message:
              "Check out our new AI-powered search capabilities in the gallery.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            read: false,
            type: "info",
          },
          {
            id: "3",
            title: "Storage Warning",
            message:
              "You're approaching your storage limit. Consider upgrading your plan.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true,
            type: "warning",
          },
        ];

        // Only add demo notifications if we don't have any yet
        if (notifications.length === 0) {
          setNotifications(demoNotifications);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    // Set up polling for new notifications (every 5 minutes)
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, session, enabled]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    if (!enabled) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        enabled,
        setEnabled,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
