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
import { getUserQueueUrl } from "@/lib/sqs-client";

type NotificationsContextType = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  pollForMessages: () => Promise<void>;
  queueUrl: string | null;
  isPolling: boolean;
  pollingError: string | null;
  pollingSuccess: boolean;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (hasUnread: boolean) => void;
  markAllAsRead: () => void;
  deleteNotification: (receiptHandle: string) => Promise<void>;
  fetchNotifications: () => Promise<any[]>;
};

const NotificationsContext = createContext<NotificationsContextType>({
  enabled: true,
  setEnabled: () => {},
  pollForMessages: async () => {},
  queueUrl: null,
  isPolling: false,
  pollingError: null,
  pollingSuccess: false,
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
  const [queueUrl, setQueueUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollingError, setPollingError] = useState<string | null>(null);
  const [pollingSuccess, setPollingSuccess] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastPolled, setLastPolled] = useState<number>(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] =
    useState<boolean>(false);
  const [lastNotificationCount, setLastNotificationCount] = useState<number>(0);
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

      // Set the queue URL for the user
      if (user.email) {
        const url = getUserQueueUrl(user.email);
        setQueueUrl(url);
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

  // Fetch notifications from both DynamoDB and SQS
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
    async (receiptHandle: string) => {
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
        setNotifications((prev) =>
          prev.filter((n) => n.receiptHandle !== receiptHandle)
        );
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

  // Poll for messages from SQS queue
  const pollForMessages = useCallback(async () => {
    if (!user || !session?.access_token || !enabled) return;

    setIsPolling(true);
    setPollingError(null);
    setPollingSuccess(false);

    try {
      const response = await fetch("/api/notifications/poll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Polling error response:", errorData);

        // Check if we have detailed information about missing variables
        if (
          errorData.missingVariables &&
          errorData.missingVariables.length > 0
        ) {
          throw new Error(
            `SQS not configured. Missing environment variables: ${errorData.missingVariables.join(
              ", "
            )}`
          );
        }

        throw new Error(errorData.error || "Failed to poll for notifications");
      }

      const data = await response.json();
      console.log("Polling success response:", data);

      if (data.queueUrl) {
        setQueueUrl(data.queueUrl);
      }

      setPollingSuccess(true);
      setLastPolled(Date.now());

      // Fetch notifications after successful polling
      const newNotifications = await fetchNotifications();

      // Check if we have new notifications since last poll
      if (newNotifications.length > lastNotificationCount) {
        setHasUnreadNotifications(true);
        setLastNotificationCount(newNotifications.length);
      }
    } catch (error: any) {
      console.error("Error polling SQS:", error);
      setPollingError(error.message || "Failed to poll for notifications");
    } finally {
      setIsPolling(false);
    }
  }, [user, session, enabled, fetchNotifications, lastNotificationCount]);

  return (
    <NotificationsContext.Provider
      value={{
        enabled,
        setEnabled,
        pollForMessages,
        queueUrl,
        isPolling,
        pollingError,
        pollingSuccess,
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
