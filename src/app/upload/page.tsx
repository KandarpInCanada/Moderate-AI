"use client";

import UploadContainer from "@/components/upload/upload-container";
import Sidebar from "@/components/dashboard/sidebar";

export default function UploadPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeView="upload" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <UploadContainer />
        </main>
      </div>
    </div>
  );
}
