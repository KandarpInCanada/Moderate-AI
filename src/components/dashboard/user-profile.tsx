"use client";

import { useAuth } from "@/context/auth-context";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserProfile() {
  const { user, profileUrl, signOut } = useAuth();
  const router = useRouter();

  // Debug function to log auth data
  useEffect(() => {
    console.log("Profile URL in sidebar:", profileUrl);
  }, [profileUrl]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (!user) return null;

  // Get user initials for avatar
  const getInitials = () => {
    if (!user.user_metadata?.name) return "U";

    const nameParts = user.user_metadata.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();

    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Use a default placeholder if profileUrl is not available
  const avatarUrl =
    profileUrl || "https://placehold.co/100x100/EEEEEE/999999?text=User";

  return (
    <div className="flex items-center p-2 rounded-lg hover:bg-muted transition-all cursor-pointer">
      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
        {profileUrl ? (
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Error loading profile image in sidebar:", e);
              // Set a fallback on error
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://placehold.co/100x100/EEEEEE/999999?text=User";
            }}
          />
        ) : (
          <div className="h-10 w-10 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-full flex items-center justify-center font-medium">
            {getInitials()}
          </div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-foreground">
          {user.user_metadata?.name || user.email}
        </p>
        <p className="text-xs text-muted-foreground">Free Plan</p>
      </div>
      <button
        onClick={handleSignOut}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
