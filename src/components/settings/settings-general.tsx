"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SettingsGeneral() {
  const { user, profileUrl, signOut } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Update form data when user data is available
  useEffect(() => {
    if (user) {
      // Extract name parts from Google user data
      let firstName = "";
      let lastName = "";

      if (user.user_metadata?.name) {
        const nameParts = user.user_metadata.name.split(" ");
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      }

      setFormData({
        firstName,
        lastName,
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        General Information
      </h3>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-md mb-3">
            {profileUrl ? (
              <img
                src={profileUrl || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-white text-4xl font-medium">
                  {formData.firstName.charAt(0)}
                  {formData.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {profileUrl
              ? "Profile photo from Google"
              : "No profile photo available"}
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                readOnly
                className="w-full px-3 py-2 border border-input rounded-lg bg-muted/50 text-foreground"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                readOnly
                className="w-full px-3 py-2 border border-input rounded-lg bg-muted/50 text-foreground"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-3 py-2 border border-input rounded-lg bg-muted/50 text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email address is managed by Google
            </p>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Account Actions
        </h3>
        <button
          onClick={handleSignOut}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
