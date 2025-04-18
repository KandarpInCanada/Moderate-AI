"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ModerationOverview from "./moderation-overview";

export default function Dashboard() {
  const [view, setView] = useState<string>("dashboard");

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ModerationOverview />
    </div>
  );
}
