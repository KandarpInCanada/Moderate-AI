"use client";

import { X, Upload, Check, Loader2, Trash2, Eye } from "lucide-react";
import type { FileWithPreview } from "@/types/file";
import Image from "next/image";
import { useState } from "react";

interface UploadedFilesProps {
  files: FileWithPreview[];
  onRemove: (file: FileWithPreview) => void;
  onUpload: () => void;
  uploading: boolean;
  progress: Record<string, number>;
}

export default function UploadedFiles({
  files,
  onRemove,
  onUpload,
  uploading,
  progress,
}: UploadedFilesProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-900">
            Selected Images ({files.length})
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => files.forEach(onRemove)}
              disabled={uploading}
              className={`
                flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                ${
                  uploading
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Clear All
            </button>
            <button
              onClick={onUpload}
              disabled={uploading || files.length === 0}
              className={`
                flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${
                  uploading
                    ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload to S3
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="group relative">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
                <Image
                  src={file.preview || "/placeholder.svg"}
                  alt={file.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Progress overlay */}
                {uploading &&
                  progress[file.name] > 0 &&
                  progress[file.name] < 100 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                      <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {progress[file.name]}%
                        </span>
                      </div>
                    </div>
                  )}

                {/* Success overlay */}
                {uploading && progress[file.name] === 100 && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-30 flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                )}

                {/* Hover actions */}
                {!uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewImage(file.preview)}
                        className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => onRemove(file)}
                        className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-700" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2">
                <p
                  className="text-sm font-medium text-gray-800 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="max-h-[90vh] max-w-full object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
