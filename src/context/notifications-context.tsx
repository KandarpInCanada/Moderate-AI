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

  // Fetch notifications
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
      setNotifications(data.notifications || []);
      return data.notifications || [];
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      return [];
    }
  }, [user, session]);

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
      await fetchNotifications();
    } catch (error: any) {
      console.error("Error polling SQS:", error);
      setPollingError(error.message || "Failed to poll for notifications");
    } finally {
      setIsPolling(false);
    }
  }, [user, session, enabled, fetchNotifications]);

  // Auto-poll for messages every 30 seconds if enabled
  useEffect(() => {
    if (!enabled || !user) return;

    // Initial poll when component mounts
    if (lastPolled === 0) {
      pollForMessages();
    }

    const interval = setInterval(() => {
      pollForMessages();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [enabled, user, pollForMessages, lastPolled]);

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
