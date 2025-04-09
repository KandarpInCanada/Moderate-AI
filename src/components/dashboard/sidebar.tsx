"use client";
import { LayoutDashboard, Upload, LogOut, ImageIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || (pathname?.startsWith(path) && path !== "/");
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Main
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className={`flex w-full items-center px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive("/")
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:bg-gray-100"
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
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:bg-gray-100"
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
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Upload className="mr-3 h-5 w-5" />
                Upload Images
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
          <div className="h-10 w-10 bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-full flex items-center justify-center font-medium">
            JD
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
