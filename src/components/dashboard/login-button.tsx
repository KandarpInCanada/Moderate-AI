"use client";

import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export default function LoginButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/login")}
      className="flex items-center justify-center w-full p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <LogIn className="h-5 w-5 mr-2" />
      <span className="font-medium">Sign In</span>
    </button>
  );
}
