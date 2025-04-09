"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  HelpCircle,
  FileCode,
} from "lucide-react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: "projects" | "editor") => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-purple-600">ModerateAI</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigate("projects")}
              className={`flex w-full items-center p-3 ${
                activeView === "projects"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-800 hover:bg-gray-100"
              } rounded-md font-medium`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Projects
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-medium">
            N
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">John Doe</p>
            <p className="text-xs text-gray-600">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
