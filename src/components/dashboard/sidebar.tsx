"use client";
import {
  LayoutDashboard,
  Upload,
  LogOut,
  ImageIcon,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (path: string) => {
    return pathname === path || (pathname?.startsWith(path) && path !== "/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ModerateAI
          </h1>
        </div>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            MAIN
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className={`flex w-full items-center px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive("/")
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <LayoutDashboard className="mr-3 h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/gallery"
                className={`flex w-full items-center px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive("/gallery")
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <ImageIcon className="mr-3 h-5 w-5" />
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/upload"
                className={`flex w-full items-center px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive("/upload")
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Upload className="mr-3 h-5 w-5" />
                Upload Images
              </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className={`flex w-full items-center px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive("/settings")
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm text-muted-foreground">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </div>
        <div className="flex items-center p-2 rounded-lg hover:bg-muted transition-all cursor-pointer">
          <div className="h-10 w-10 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-full flex items-center justify-center font-medium">
            JD
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-foreground">John Doe</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
