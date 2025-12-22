// src/components/admin/ImageUpload.tsx
"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  id?: string; // Unique ID for the file input
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  id = "image-upload",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products")
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        return await response.json();
      });
      
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.secure_url);
      onChange([...images, ...newUrls]);
    } catch (err) {
      setError("Failed to upload images. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    await fetch(`/api/upload?imageCloudURL=${images[index]}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <label
            htmlFor={id}
            className={`
              flex items-center justify-center gap-2 px-4 py-3 
              border-2 border-dashed border-gray-300 rounded-lg
              cursor-pointer hover:border-blue-500 hover:bg-blue-50
              transition-colors ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }
            `}
          >
            <Upload size={20} />
            <span>{uploading ? "Uploading..." : "Upload Images"}</span>
          </label>
          <input
            id={id}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
