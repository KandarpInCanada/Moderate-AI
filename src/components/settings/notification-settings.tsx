"use client";
import { useState } from "react";
import NotificationToggle from "./notification-toggle";
import { useNotifications } from "@/context/notifications-context";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function NotificationSettings() {
  const { enabled, pollForMessages, isPolling, pollingError, pollingSuccess } =
    useNotifications();
  const [showPollSuccess, setShowPollSuccess] = useState(false);

  const handlePollForMessages = async () => {
    await pollForMessages();
    setShowPollSuccess(true);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowPollSuccess(false);
    }, 5000);
  };

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

        {/* Notifications page link */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Notifications
            </h4>
          </div>

          <Link
            href="/notifications"
            className={`flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/80 transition-colors ${
              !enabled ? "opacity-70 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-primary mr-3" />
              <div>
                <h4 className="text-sm font-medium text-foreground">
                  View Notifications
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {enabled
                    ? "Check your notifications about image processing and system updates"
                    : "Enable notifications to view your notification history"}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>

        {/* SQS Connection Status */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            AWS SQS Connection Status
          </h4>
          <div
            className={`bg-muted/50 rounded-lg p-4 border border-border ${
              !enabled ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-3 ${
                    !enabled
                      ? "bg-gray-400"
                      : pollingError
                      ? "bg-red-500"
                      : pollingSuccess
                      ? "bg-green-500"
                      : "bg-gray-400"
                  }`}
                ></div>
                <div>
                  <h5 className="text-sm font-medium text-foreground">
                    {!enabled
                      ? "Disabled"
                      : pollingError
                      ? "Disconnected"
                      : pollingSuccess
                      ? "Connected"
                      : "Unknown"}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!enabled
                      ? "Notifications are currently disabled"
                      : pollingError
                      ? "Unable to connect to AWS SQS"
                      : pollingSuccess
                      ? "Successfully connected to AWS SQS"
                      : "Connection status unknown"}
                  </p>
                </div>
              </div>
              <button
                onClick={handlePollForMessages}
                disabled={isPolling || !enabled}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                  isPolling || !enabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isPolling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Check Connection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Success message */}
        {showPollSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-4 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-400">
                Connection Successful
              </h4>
              <p className="text-green-700 dark:text-green-500 text-sm">
                Successfully connected to AWS SQS notification service.
              </p>
            </div>
          </div>
        )}

        {/* Error message for connection errors */}
        {pollingError && enabled && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-400">
                Connection Error
              </h4>
              <p className="text-red-700 dark:text-red-500 text-sm">
                {pollingError}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
