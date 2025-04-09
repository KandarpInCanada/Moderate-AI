"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Sidebar from "@/components/dashboard/sidebar";
import UploadArea from "./upload-area";
import UploadedFiles from "./uploaded-files";
import type { FileWithPreview } from "@/types/file";
import { AlertCircle, CheckCircle } from "lucide-react";
import { uploadFileWithPresignedUrl } from "@/lib/s3-client";

export default function UploadContainer() {
  const { user, loading, session } = useAuth();
  const router = useRouter();

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [detailedError, setDetailedError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // If still loading or not authenticated, show nothing
  if (loading || !user) {
    return null;
  }

  const handleFilesAdded = (newFiles: FileWithPreview[]) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadComplete(false);
    setError(null);
    setDetailedError(null);
  };

  const handleRemoveFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadComplete(false);
    setError(null);
    setDetailedError(null);
    setUploadedUrls([]);

    const initialProgress: Record<string, number> = {};
    files.forEach((file) => {
      initialProgress[file.name] = 0;
    });
    setUploadProgress(initialProgress);

    try {
      // Get the access token from the session
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error(
          "Authentication token not available. Please log in again."
        );
      }

      // Upload each file
      const uploadPromises = files.map(async (file) => {
        try {
          // Get pre-signed URL from our API
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              fileSize: file.size,
            }),
          });

          // Add this error handling to check for non-JSON responses
          if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to get upload URL");
            } else {
              // Handle HTML or other non-JSON responses
              const errorText = await response.text();
              console.error("Non-JSON error response:", errorText);
              throw new Error(
                `Server error: ${response.status} ${response.statusText}`
              );
            }
          }

          const presignedData = await response.json();

          // Upload the file using the pre-signed URL
          const fileUrl = await uploadFileWithPresignedUrl(
            file,
            presignedData,
            (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: progress,
              }));
            }
          );

          return fileUrl;
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          // Capture detailed error information
          setDetailedError(
            (prev) =>
              `${prev ? prev + "\n\n" : ""}Error uploading ${file.name}: ${
                error.message
              }`
          );
          throw error;
        }
      });

      // Wait for all uploads to complete
      const urls = await Promise.all(uploadPromises);
      setUploadedUrls(urls);
      setUploadComplete(true);

      // Clear files after a delay
      setTimeout(() => {
        setFiles([]);
        setUploadProgress({});
      }, 2000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      setError(error.message || "Failed to upload files. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Sidebar activeView="upload" onNavigate={() => {}} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Page intro */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Upload Images
              </h2>
              <p className="text-muted-foreground mt-1">
                Upload your photos for AI-powered organization and analysis with
                AWS Rekognition.
              </p>
            </div>

            {/* Upload area */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6 transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Upload Files
              </h3>
              <UploadArea
                onFilesAdded={handleFilesAdded}
                disabled={uploading}
              />
            </div>

            {/* Status messages */}
            {uploadComplete && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-xl p-4 flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    Upload Complete
                  </h4>
                  <p className="text-green-700 dark:text-green-500 text-sm">
                    Your files have been uploaded to your personal folder and
                    queued for AI analysis.
                  </p>
                  {uploadedUrls.length > 0 && (
                    <div className="mt-2 text-xs text-green-700 dark:text-green-500">
                      <p>
                        Files uploaded to your personal folder: {user.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-400">
                    Upload Failed
                  </h4>
                  <p className="text-red-700 dark:text-red-500 text-sm">
                    {error}
                  </p>

                  {detailedError && (
                    <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded text-xs font-mono whitespace-pre-wrap text-red-800 dark:text-red-300 max-h-40 overflow-auto">
                      {detailedError}
                    </div>
                  )}
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
