"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";
import Sidebar from "@/components/dashboard/sidebar";
import NotificationsList from "@/components/notifications/notifications-list";
import { Bell, BellOff, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const { enabled, fetchNotifications, isPolling } = useNotifications();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotifications();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="notifications" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Back button */}
            <Link
              href="/settings"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Link>

            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground flex items-center">
                  <Bell className="mr-3 h-6 w-6 text-primary" />
                  Notifications
                </h2>
                <p className="text-muted-foreground mt-1">
                  View and manage your notifications about image processing and
                  system updates
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isPolling || !enabled}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
                  isRefreshing || isPolling || !enabled
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1.5 ${
                    isRefreshing || isPolling ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            {/* Notifications status */}
            {!enabled && (
              <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6 text-center">
                <BellOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Notifications are currently disabled
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  Enable notifications in settings to receive updates about
                  image processing and system updates
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
                >
                  Go to Settings
                </Link>
              </div>
            )}

            {/* Notifications list */}
            {enabled && <NotificationsList />}
          </div>
        </main>
      </div>
    </div>
  );
}
