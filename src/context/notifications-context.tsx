"use client";

import type React from "react";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/context/auth-context";
import { getUserTopicArn } from "@/lib/sns-client";

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
  subscribeToSNS: () => Promise<void>;
  topicArn: string | null;
  isSubscribing: boolean;
  subscriptionError: string | null;
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
  subscribeToSNS: async () => {},
  topicArn: null,
  isSubscribing: false,
  subscriptionError: null,
});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [topicArn, setTopicArn] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );
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

      // Set the topic ARN for the user
      if (user.email) {
        const arn = getUserTopicArn(user.email);
        setTopicArn(arn);
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
  const fetchNotifications = useCallback(async () => {
    if (!user || !session?.access_token || !enabled) return;

    try {
      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();

      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user, session, enabled]);

  // Subscribe to SNS topic
  const subscribeToSNS = async () => {
    if (!user || !session?.access_token) return;

    setIsSubscribing(true);
    setSubscriptionError(null);

    try {
      // For web applications, we'll use an HTTPS endpoint
      // In a real application, you would create a unique endpoint for each user session
      // Here we're using the notifications webhook endpoint
      const endpoint = `${window.location.origin}/api/notifications/webhook`;

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          endpoint,
          protocol: "https",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to subscribe to notifications"
        );
      }

      const data = await response.json();

      if (data.topicArn) {
        setTopicArn(data.topicArn);
      }

      // Fetch notifications after subscribing
      await fetchNotifications();
    } catch (error: any) {
      console.error("Error subscribing to SNS:", error);
      setSubscriptionError(
        error.message || "Failed to subscribe to notifications"
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  // Subscribe to SNS when user logs in and notifications are enabled
  useEffect(() => {
    if (user && session?.access_token && enabled && !topicArn) {
      subscribeToSNS();
    }
  }, [user, session, enabled, topicArn]);

  // Fetch notifications on mount and periodically
  useEffect(() => {
    fetchNotifications();

    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30 * 1000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    // Update on the server
    if (user && session?.access_token) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            notificationIds: [id],
            markAll: false,
          }),
        });
      } catch (error) {
        console.error("Failed to mark notification as read on server:", error);
      }
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );

    // Update on the server
    if (user && session?.access_token) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            markAll: true,
          }),
        });
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read on server:",
          error
        );
      }
    }
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
        subscribeToSNS,
        topicArn,
        isSubscribing,
        subscriptionError,
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
