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
import { getUserTopicArn } from "@/lib/sns-client";

type NotificationsContextType = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  subscribeToSNS: () => Promise<void>;
  topicArn: string | null;
  isSubscribing: boolean;
  subscriptionError: string | null;
  subscriptionSuccess: boolean;
};

const NotificationsContext = createContext<NotificationsContextType>({
  enabled: true,
  setEnabled: () => {},
  subscribeToSNS: async () => {},
  topicArn: null,
  isSubscribing: false,
  subscriptionError: null,
  subscriptionSuccess: false,
});

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [topicArn, setTopicArn] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(
    null
  );
  const [subscriptionSuccess, setSubscriptionSuccess] =
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

      // Set the topic ARN for the user
      if (user.email) {
        const arn = getUserTopicArn(user.email);
        setTopicArn(arn);
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

  // Subscribe to SNS topic
  const subscribeToSNS = useCallback(async () => {
    if (!user || !session?.access_token) return;

    setIsSubscribing(true);
    setSubscriptionError(null);
    setSubscriptionSuccess(false);

    try {
      // For web applications, we'll use an HTTPS endpoint
      // Make sure the endpoint is a complete URL with https:// protocol
      const endpoint = new URL(
        "/api/notifications/webhook",
        window.location.origin
      ).toString();
      console.log(`Using endpoint for subscription: ${endpoint}`);

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
        console.error("Subscription error response:", errorData);

        // Check if we have detailed information about missing variables
        if (
          errorData.missingVariables &&
          errorData.missingVariables.length > 0
        ) {
          throw new Error(
            `SNS not configured. Missing environment variables: ${errorData.missingVariables.join(
              ", "
            )}`
          );
        }

        throw new Error(
          errorData.error || "Failed to subscribe to notifications"
        );
      }

      const data = await response.json();
      console.log("Subscription success response:", data);

      if (data.topicArn) {
        setTopicArn(data.topicArn);
      }

      setSubscriptionSuccess(true);
    } catch (error: any) {
      console.error("Error subscribing to SNS:", error);
      setSubscriptionError(
        error.message || "Failed to subscribe to notifications"
      );
    } finally {
      setIsSubscribing(false);
    }
  }, [user, session]);

  return (
    <NotificationsContext.Provider
      value={{
        enabled,
        setEnabled,
        subscribeToSNS,
        topicArn,
        isSubscribing,
        subscriptionError,
        subscriptionSuccess,
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
