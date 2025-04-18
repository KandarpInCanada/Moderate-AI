"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Sidebar from "@/components/dashboard/sidebar";
import { motion } from "framer-motion";

export default function CollectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Redirect to the gallery page which now includes collections
    router.push("/gallery");
  }, [router]);

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  // This page will redirect to gallery, but we'll show a loading state briefly
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="collections" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-64"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-foreground">
                  Redirecting to gallery...
                </p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
