"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";

export default function LoginContainer() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ModerateAI
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sign in to access your content moderation dashboard
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            <Image src="/google-logo.svg" alt="Google" width={20} height={20} />
            Sign in with Google
          </button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
