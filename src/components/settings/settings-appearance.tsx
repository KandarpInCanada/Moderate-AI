"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";

export default function SettingsAppearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-6">Appearance</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Theme
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setTheme("light")}
              className={`relative cursor-pointer rounded-lg border p-4 flex flex-col items-center ${
                theme === "light"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${
                  theme === "light"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Sun className="h-5 w-5" />
              </div>
              <span
                className={`font-medium ${
                  theme === "light" ? "text-primary" : "text-foreground"
                }`}
              >
                Light
              </span>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Light mode for bright environments
              </p>
              {theme === "light" && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary border-2 border-card"></div>
              )}
            </div>

            <div
              onClick={() => setTheme("dark")}
              className={`relative cursor-pointer rounded-lg border p-4 flex flex-col items-center ${
                theme === "dark"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${
                  theme === "dark"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Moon className="h-5 w-5" />
              </div>
              <span
                className={`font-medium ${
                  theme === "dark" ? "text-primary" : "text-foreground"
                }`}
              >
                Dark
              </span>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Dark mode for low-light environments
              </p>
              {theme === "dark" && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary border-2 border-card"></div>
              )}
            </div>

            <div
              onClick={() => setTheme("system")}
              className={`relative cursor-pointer rounded-lg border p-4 flex flex-col items-center ${
                theme === "system"
                  ? "border-primary bg-primary/10"
                  : "border-border"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${
                  theme === "system"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Monitor className="h-5 w-5" />
              </div>
              <span
                className={`font-medium ${
                  theme === "system" ? "text-primary" : "text-foreground"
                }`}
              >
                System
              </span>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Follow your system preferences
              </p>
              {theme === "system" && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-primary border-2 border-card"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
