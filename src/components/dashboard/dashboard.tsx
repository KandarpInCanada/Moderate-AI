"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ModerationOverview from "./moderation-overview";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show a minimal loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="h-8 w-64 bg-muted rounded animate-pulse mb-4"></div>
        <div className="h-4 w-96 bg-muted rounded animate-pulse mb-8"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <ModerationOverview />
    </div>
  );
}
