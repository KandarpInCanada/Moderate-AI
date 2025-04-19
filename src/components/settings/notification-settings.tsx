"use client";
import { useState } from "react";
import NotificationToggle from "./notification-toggle";
import { useNotifications } from "@/context/notifications-context";
import {
  AlertCircle,
  Bell,
  ArrowRight,
  Copy,
  Link,
  CheckCircle,
} from "lucide-react";
import NextLink from "next/link";
import WebhookDocumentation from "./webhook-documentation";

export default function NotificationSettings() {
  const { enabled, webhookUrl } = useNotifications();
  const [showCopied, setShowCopied] = useState(false);

  const handleCopyWebhookUrl = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
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

          <NextLink
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
          </NextLink>
        </div>

        {/* Webhook URL */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Webhook Endpoint
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
                    !enabled ? "bg-gray-400" : "bg-green-500"
                  }`}
                ></div>
                <div>
                  <h5 className="text-sm font-medium text-foreground">
                    {!enabled ? "Disabled" : "Active"}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!enabled
                      ? "Notifications are currently disabled"
                      : "Your personal webhook endpoint is active"}
                  </p>
                </div>
              </div>
            </div>

            {enabled && webhookUrl && (
              <div className="mt-4 p-3 bg-background rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <Link className="h-4 w-4 text-primary mr-2" />
                  <p className="text-xs font-mono text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                    {webhookUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopyWebhookUrl}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  title="Copy webhook URL"
                >
                  {showCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This is your personal webhook endpoint for receiving notifications.
            You can configure AWS SNS to send notifications to this URL.
          </p>
        </div>

        {/* Information about webhooks */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-400">
              About Webhooks
            </h4>
            <p className="text-blue-700 dark:text-blue-500 text-sm">
              Webhooks allow external services like AWS SNS to send
              notifications directly to your application. Configure your AWS SNS
              topics to publish to your personal webhook URL to receive
              real-time notifications.
            </p>
          </div>
        </div>

        {/* Add the webhook documentation component */}
        <WebhookDocumentation />
      </div>
    </div>
  );
}
