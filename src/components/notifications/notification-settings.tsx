"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Bell,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Phone,
} from "lucide-react";

interface Subscription {
  endpoint: string;
  protocol: string;
  status: "pending" | "confirmed";
}

export default function NotificationSettings() {
  const { user, session } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  // Fetch current subscription status
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!session?.access_token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/notifications/subscribe", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch subscription status");
        }

        const data = await response.json();

        if (data.success && data.hasSubscription) {
          setSubscriptions(data.subscriptions);
        } else {
          setSubscriptions([]);
        }
      } catch (err: any) {
        console.error("Error fetching subscriptions:", err);
        setError(err.message || "Failed to load subscription status");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [session]);

  // Update the handleSubscribe function to automatically use the user's email
  // Replace the existing handleSubscribe function with this updated version

  const handleSubscribe = async (type: "email" | "sms") => {
    if (!session?.access_token) return;

    try {
      setSubscribing(true);
      setError(null);
      setSuccess(null);

      // For email, use the user's login email automatically
      const endpoint = type === "email" ? user?.email : phone;

      if (!endpoint) {
        setError(
          `${
            type === "email"
              ? "User email not available"
              : "Please enter a valid phone number"
          }`
        );
        return;
      }

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionType: type,
          endpoint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe");
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(
          `Subscription request sent! ${
            type === "email"
              ? "Please check your email to confirm."
              : "Please check your phone for a confirmation message."
          }`
        );

        // Refresh subscriptions list
        const refreshResponse = await fetch("/api/notifications/subscribe", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.hasSubscription) {
            setSubscriptions(refreshData.subscriptions);
          }
        }
      }
    } catch (err: any) {
      console.error("Error subscribing:", err);
      setError(err.message || "Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async (subscriptionArn: string) => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subscriptionArn,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unsubscribe");
      }

      const data = await response.json();

      if (data.success) {
        setSuccess("Successfully unsubscribed");

        // Refresh subscriptions list
        const refreshResponse = await fetch("/api/notifications/subscribe", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.hasSubscription) {
            setSubscriptions(refreshData.subscriptions);
          } else {
            setSubscriptions([]);
          }
        }
      }
    } catch (err: any) {
      console.error("Error unsubscribing:", err);
      setError(err.message || "Failed to unsubscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Notification Settings
      </h3>

      <div className="space-y-6">
        {/* Status messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-3 flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        {/* Current subscriptions */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Current Notification Subscriptions
          </h4>

          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading subscriptions...
              </span>
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              You don't have any active notification subscriptions. Subscribe
              below to receive alerts when your images are processed.
            </p>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-card p-3 rounded-md border border-border"
                >
                  <div className="flex items-center">
                    {sub.protocol === "email" ? (
                      <Mail className="h-4 w-4 text-primary mr-2" />
                    ) : (
                      <Phone className="h-4 w-4 text-primary mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {sub.endpoint}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.status === "pending"
                          ? "Pending confirmation"
                          : "Active"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.endpoint)}
                    className="p-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email subscription */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Email Notifications
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Receive email notifications when your images are processed by AWS
            Rekognition.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center bg-muted/50 p-3 rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground mr-2" />
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Login Email
              </span>
            </div>

            <button
              onClick={() => handleSubscribe("email")}
              disabled={subscribing}
              className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                subscribing
                  ? "bg-primary/70 text-primary-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe with Login Email"
              )}
            </button>
          </div>
        </div>

        {/* SMS subscription */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            SMS Notifications
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Receive SMS notifications when your images are processed by AWS
            Rekognition.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number (+1234567890)"
              className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground"
            />
            <button
              onClick={() => handleSubscribe("sms")}
              disabled={subscribing || !phone}
              className={`px-4 py-2 rounded-lg font-medium flex items-center justify-center ${
                subscribing
                  ? "bg-primary/70 text-primary-foreground cursor-not-allowed"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
              }`}
            >
              {subscribing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enter your phone number in international format (e.g., +1234567890)
          </p>
        </div>

        {/* Info about notifications */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
            About Image Processing Notifications
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-500">
            When you upload images to PhotoSense, they are automatically
            analyzed by AWS Rekognition to detect objects, faces, text, and
            more. You'll receive notifications when this analysis is complete,
            including details about what was detected in your images.
          </p>
        </div>
      </div>
    </div>
  );
}
