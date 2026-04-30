"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RatingStars from "@/components/rating";
import ImageLightbox from "./ImageLightbox";
import type { ClientReview } from "@/types/review";

interface ReviewCardProps {
  review: ClientReview;
}

/**
 * Displays a single review with avatar, name, rating, body, images, and timestamp.
 */
export default function ReviewCard({ review }: ReviewCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const displayName =
    (review.user?.name ?? review.userName) || "Anonymous";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
  });

  const images = review.images?.filter(Boolean) ?? [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <article className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        {/* Header: avatar + name + timestamp */}
        <header className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0 border border-gray-100 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-[#88D9E6] to-[#FF5714] text-white text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
              <time
                dateTime={review.createdAt}
                className="shrink-0 text-xs text-gray-400"
              >
                {timeAgo}
              </time>
            </div>
            <div className="mt-1">
              <RatingStars rating={review.rating} size={14} />
            </div>
          </div>
        </header>

        {/* Review content */}
        <div className="space-y-2">
          {review.title && (
            <h4 className="font-semibold text-gray-800 text-sm leading-snug">
              {review.title}
            </h4>
          )}
          {review.body && (
            <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>
          )}
        </div>

        {/* Review images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openLightbox(i)}
                className="group relative h-16 w-16 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 transition-all hover:border-[#88D9E6] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5714]"
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img}
                  alt={`Review image ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </article>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
