"use client";

import React, { useRef, useState, useCallback } from "react";
import { X, Upload, ImagePlus, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface UploadedImage {
  url: string;       // Cloudinary secure_url
  publicId: string;  // for display & delete
  isUploading?: boolean;
}

interface ImageUploaderProps {
  slug: string;             // product slug → Cloudinary folder path
  value: string[];          // array of uploaded URLs (controlled)
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

/**
 * Multi-image uploader for review images.
 * - Uploads to Cloudinary via POST /api/upload
 * - Deletes from Cloudinary via DELETE /api/upload?imageCloudURL=...
 * - Exposes uploaded URLs to parent via onChange
 */
export default function ImageUploader({
  slug,
  value,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(
    value.map((url) => ({ url, publicId: url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = uploadedImages.filter((i) => !i.isUploading).length < maxImages;
  const isUploading = uploadedImages.some((i) => i.isUploading);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedImage | null> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `products/${slug}/reviews`);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return { url: data.secure_url, publicId: data.public_id };
    },
    [slug]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const currentCount = uploadedImages.filter((i) => !i.isUploading).length;
      const allowed = maxImages - currentCount;
      const toUpload = Array.from(files).slice(0, allowed);

      if (toUpload.length === 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Add placeholders for uploading items
      const placeholders: UploadedImage[] = toUpload.map((_, i) => ({
        url: "",
        publicId: `uploading-${Date.now()}-${i}`,
        isUploading: true,
      }));

      setUploadedImages((prev) => [...prev, ...placeholders]);

      const results = await Promise.allSettled(toUpload.map(uploadFile));

      setUploadedImages((prev) => {
        let updated = [...prev];
        let placeholderIndex = 0;

        results.forEach((result) => {
          // Find the next placeholder
          const idx = updated.findIndex(
            (img) => img.publicId === placeholders[placeholderIndex]?.publicId
          );
          if (idx === -1) { placeholderIndex++; return; }

          if (result.status === "fulfilled" && result.value) {
            updated[idx] = result.value;
          } else {
            updated = updated.filter((_, i) => i !== idx);
            toast.error("Failed to upload one or more images");
          }
          placeholderIndex++;
        });

        const urls = updated.filter((i) => !i.isUploading && i.url).map((i) => i.url);
        onChange(urls);
        return updated;
      });
    },
    [uploadedImages, maxImages, uploadFile, onChange]
  );

  const handleRemove = useCallback(
    async (img: UploadedImage) => {
      // Optimistically remove
      setUploadedImages((prev) => prev.filter((i) => i.url !== img.url));
      onChange(uploadedImages.filter((i) => i.url !== img.url && !i.isUploading).map((i) => i.url));

      // Delete from Cloudinary
      try {
        await fetch(`/api/upload?imageCloudURL=${encodeURIComponent(img.url)}`, {
          method: "DELETE",
        });
      } catch {
        toast.error("Failed to delete image from server");
      }
    },
    [uploadedImages, onChange]
  );

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">
        Review Images
        <span className="ml-2 text-xs font-normal text-gray-400">
          (optional, max {maxImages})
        </span>
      </label>

      {/* Upload drop zone */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload images"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-all
            ${isDragging
              ? "border-[#FF5714] bg-orange-50"
              : "border-gray-200 bg-gray-50 hover:border-[#88D9E6] hover:bg-cyan-50/30"
            }
          `}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <ImagePlus size={20} className="text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">
              <span className="text-[#FF5714]">Click to upload</span> or drag &amp; drop
            </p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP up to 10MB</p>
          </div>
          <Upload size={14} className="text-gray-300" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        aria-hidden="true"
      />

      {/* Preview grid */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {uploadedImages.map((img, i) => (
            <div
              key={img.publicId || i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
            >
              {img.isUploading ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <Image
                    src={img.url}
                    alt={`Upload ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(img)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 focus:opacity-100 focus:outline-none"
                    aria-label="Remove image"
                  >
                    <X size={10} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <Loader2 size={12} className="animate-spin" />
          Uploading…
        </p>
      )}
    </div>
  );
}
