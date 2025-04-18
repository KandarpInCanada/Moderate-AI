"use client";
import { useState } from "react";
import NotificationToggle from "./notification-toggle";
import { useNotifications } from "@/context/notifications-context";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function NotificationSettings() {
  const { pollForMessages, queueUrl, isPolling, pollingError, pollingSuccess } =
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

  // Add a helper function to display missing variables if they're in the error message
  const extractMissingVars = (errorMessage: string | null) => {
    if (!errorMessage) return null;

    // Check if the error message contains information about missing variables
    if (errorMessage.includes("Missing environment variables:")) {
      return errorMessage
        .split("Missing environment variables:")[1]
        .trim()
        .split(", ");
    }

    return null;
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

        {/* SQS Integration */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            AWS SQS Integration
          </h4>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-medium text-foreground">
                  Message Queue Notifications
                </h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Poll AWS SQS to receive notifications when your images are
                  processed
                </p>
                {queueUrl && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Queue URL: <span className="font-mono">{queueUrl}</span>
                  </p>
                )}
              </div>
              <button
                onClick={handlePollForMessages}
                disabled={isPolling}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                  isPolling
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isPolling ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Polling...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    Poll for Messages
                  </>
                )}
              </button>
            </div>

            {/* Polling status messages */}
            {pollingError && (
              <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md p-2 flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {pollingError}
                  </p>

                  {extractMissingVars(pollingError) && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-red-700 dark:text-red-400">
                        Please add these environment variables to your project:
                      </p>
                      <ul className="text-xs text-red-700 dark:text-red-400 mt-1 list-disc list-inside">
                        {extractMissingVars(pollingError)?.map((variable) => (
                          <li key={variable}>{variable}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(showPollSuccess || pollingSuccess) && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-md p-2 flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  Successfully polled SQS queue for notifications
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info about notifications */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
            About AWS SQS Notifications
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-500">
            When you upload images to PhotoSense, they are automatically
            analyzed by AWS Rekognition to detect objects, faces, text, and
            more. With AWS SQS integration, you'll receive notifications when
            this analysis is complete, including details about what was detected
            in your images.
          </p>
        </div>
      </div>
    </div>
  );
}
