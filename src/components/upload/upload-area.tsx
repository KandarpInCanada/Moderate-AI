"use client";

import type React from "react";

import { useCallback, useState } from "react";
import { Upload, ImageIcon, FileText } from "lucide-react";
import type { FileWithPreview } from "@/types/file";

interface UploadAreaProps {
  onFilesAdded: (files: FileWithPreview[]) => void;
  disabled?: boolean;
}

export default function UploadArea({
  onFilesAdded,
  disabled = false,
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [disabled, onFilesAdded]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !e.target.files?.length) return;

      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);

      // Reset the input value so the same file can be selected again
      e.target.value = "";
    },
    [disabled, onFilesAdded]
  );

  const processFiles = (files: File[]) => {
    // Filter for image files only
    const imageFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024
    );

    // Add preview URLs to files
    const filesWithPreviews = imageFiles.map((file) => {
      const preview = URL.createObjectURL(file);
      return Object.assign(file, { preview }) as FileWithPreview;
    });

    if (filesWithPreviews.length > 0) {
      onFilesAdded(filesWithPreviews);
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
        ${isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"}
        ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50"
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() =>
        !disabled && document.getElementById("file-upload")?.click()
      }
    >
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center">
        <div
          className={`
          mb-4 p-4 rounded-full transition-all duration-300
          ${
            isDragging
              ? "bg-indigo-100 text-indigo-600"
              : "bg-gray-100 text-gray-500"
          }
        `}
        >
          <Upload className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-gray-800 mb-2">
          {isDragging
            ? "Drop your images here"
            : "Drag and drop your images here"}
        </p>
        <p className="text-sm text-gray-500 mb-4">or click to browse</p>

        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center">
            <ImageIcon className="h-4 w-4 mr-1" />
            <span>JPG, PNG, GIF</span>
          </div>
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            <span>Up to 10MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
