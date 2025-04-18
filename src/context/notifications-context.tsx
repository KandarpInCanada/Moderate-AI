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
};

const NotificationsContext = createContext<NotificationsContextType>({
  enabled: true,
  setEnabled: () => {},
  pollForMessages: async () => {},
  queueUrl: null,
  isPolling: false,
  pollingError: null,
  pollingSuccess: false,
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

  // Poll for messages from SQS queue
  const pollForMessages = useCallback(async () => {
    if (!user || !session?.access_token) return;

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
    } catch (error: any) {
      console.error("Error polling SQS:", error);
      setPollingError(error.message || "Failed to poll for notifications");
    } finally {
      setIsPolling(false);
    }
  }, [user, session]);

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
