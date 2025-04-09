"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/sidebar";
import UploadArea from "./upload-area";
import UploadedFiles from "./uploaded-files";
import type { FileWithPreview } from "@/types/file";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function UploadContainer() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleFilesAdded = (newFiles: FileWithPreview[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadComplete(false);
    setError(null);
  };
  const handleRemoveFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };
  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setUploadComplete(false);
    setError(null);
    const initialProgress: Record<string, number> = {};
    files.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);
    try {
      await Promise.all(
        files.map(async (file) => {
          await simulateFileUpload(file, (progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }));
          });
        })
      );
      setUploadComplete(true);
      setTimeout(() => {
        setFiles([]);
        setUploadProgress({});
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const simulateFileUpload = async (
    file: File,
    onProgress: (progress: number) => void
  ) => {
    return new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, 300);
    });
  };

  return (
    <>
      <Sidebar activeView="upload" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Page intro */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Upload Images
              </h2>
              <p className="text-gray-600 mt-1">
                Upload your images for AI-powered content moderation. We support
                JPG, PNG, and GIF formats.
              </p>
            </div>

            {/* Upload area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Files
              </h3>
              <UploadArea
                onFilesAdded={handleFilesAdded}
                disabled={uploading}
              />
            </div>

            {/* Status messages */}
            {uploadComplete && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800">
                    Upload Complete
                  </h4>
                  <p className="text-green-700 text-sm">
                    Your files have been uploaded and queued for moderation.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800">Upload Failed</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* File list */}
            {files.length > 0 && (
              <UploadedFiles
                files={files}
                onRemove={handleRemoveFile}
                onUpload={handleUpload}
                uploading={uploading}
                progress={uploadProgress}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
