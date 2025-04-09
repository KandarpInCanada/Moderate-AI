"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get error details from URL parameters with fallbacks
  const reason = searchParams.get("reason") || "unknown";
  const message =
    searchParams.get("message") || "No additional details available";

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Authentication Error
        </h1>
        <p className="text-muted-foreground mb-4">
          There was a problem authenticating your account. Please try again or
          contact support if the issue persists.
        </p>

        <div className="bg-muted p-4 rounded-md mb-6">
          <p className="text-sm font-medium">Error details:</p>
          <p className="text-xs text-muted-foreground mt-1">Reason: {reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Message: {message}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/login")}
            className="flex-1 py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-center font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-2 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-center font-medium"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
