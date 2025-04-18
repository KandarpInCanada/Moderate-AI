"use client";
import { useState } from "react";
import NotificationToggle from "./notification-toggle";
import { useNotifications } from "@/context/notifications-context";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function NotificationSettings() {
  const {
    subscribeToSNS,
    topicArn,
    isSubscribing,
    subscriptionError,
    subscriptionSuccess,
  } = useNotifications();

  const [showSubscribeSuccess, setShowSubscribeSuccess] = useState(false);

  const handleSubscribe = async () => {
    await subscribeToSNS();
    setShowSubscribeSuccess(true);

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSubscribeSuccess(false);
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

        {/* SNS Subscription */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            AWS SNS Integration
          </h4>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="text-sm font-medium text-foreground">
                  Real-time Notifications
                </h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Subscribe to AWS SNS to receive real-time notifications when
                  your images are processed
                </p>
                {topicArn && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Topic ARN: <span className="font-mono">{topicArn}</span>
                  </p>
                )}
              </div>
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                  isSubscribing
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isSubscribing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1.5" />
                    {topicArn ? "Refresh Subscription" : "Subscribe"}
                  </>
                )}
              </button>
            </div>

            {/* Subscription status messages */}
            {subscriptionError && (
              <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-md p-2 flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  {subscriptionError}
                </p>
              </div>
            )}

            {(showSubscribeSuccess || subscriptionSuccess) && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-md p-2 flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400">
                  Successfully subscribed to SNS notifications
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info about notifications */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
            About AWS SNS Notifications
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-500">
            When you upload images to PhotoSense, they are automatically
            analyzed by AWS Rekognition to detect objects, faces, text, and
            more. With AWS SNS integration, you'll receive real-time
            notifications when this analysis is complete, including details
            about what was detected in your images.
          </p>
        </div>
      </div>
    </div>
  );
}
