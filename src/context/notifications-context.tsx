"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "@/context/auth-context";
import { getUserWebhookUrl } from "@/lib/webhook-utils";

type NotificationsContextType = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  webhookUrl: string | null;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (hasUnread: boolean) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => Promise<void>;
  fetchNotifications: () => Promise<any[]>;
};

const NotificationsContext = createContext<NotificationsContextType>({
  enabled: true,
  setEnabled: () => {},
  webhookUrl: null,
  notifications: [],
  setNotifications: () => {},
  hasUnreadNotifications: false,
  setHasUnreadNotifications: () => {},
  markAllAsRead: () => {},
  deleteNotification: async () => {},
  fetchNotifications: async () => [],
});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastNotificationCount, setLastNotificationCount] = useState<number>(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState<boolean>(false);
  const { user, session } = useAuth();

  // Load enabled state from localStorage on mount
  useEffect(() => {
    if (user) {
      const storedEnabled = localStorage.getItem(
        `photosense-notifications-enabled-${user.id}`
      );
      if (storedEnabled !== null) {
        setEnabled(storedEnabled === "true");
      }

      // Set the webhook URL for the user
      if (user.email) {
        const url = getUserWebhookUrl(user.email);
        setWebhookUrl(url);
      }

      // Fetch notifications on initial load
      fetchNotifications();
    }
  }, [user]);

  // Save enabled state to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `photosense-notifications-enabled-${user.id}`,
        enabled.toString()
      );
    }
  }, [enabled, user]);

  // Fetch notifications from DynamoDB
  const fetchNotifications = useCallback(async () => {
    if (!user || !session?.access_token) return [];

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
      const newNotifications = data.notifications || [];

      // Check if we have new notifications
      if (newNotifications.length > lastNotificationCount) {
        setHasUnreadNotifications(true);
        setLastNotificationCount(newNotifications.length);
      }

      setNotifications(newNotifications);
      return newNotifications;
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  }, [user, session, lastNotificationCount]);

  // Delete a notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user || !session?.access_token) return;

      try {
        await fetch("/api/notifications", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ notificationId, source: "dynamodb" }),
        });

        // Remove from local state
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [user, session]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setHasUnreadNotifications(false);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        enabled,
        setEnabled,
        webhookUrl,
        notifications,
        setNotifications,
        hasUnreadNotifications,
        setHasUnreadNotifications,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
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
