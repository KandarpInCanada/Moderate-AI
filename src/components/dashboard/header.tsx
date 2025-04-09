"use client";

import { ArrowLeft, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function Header({
  title,
  showBackButton = false,
  onBackClick,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 py-7 px-6 flex items-center justify-between">
      <div className="flex items-center">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="mr-3 p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>
    </header>
  );
}
