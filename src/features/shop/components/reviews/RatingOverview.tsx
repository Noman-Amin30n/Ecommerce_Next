"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import RatingStars from "@/components/common/Rating";
import type { ReviewsApiResponse } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";

interface RatingOverviewProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: ReviewsApiResponse["ratingDistribution"];
  isLoading: boolean;
}

const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

/**
 * Displays the aggregate review statistics:
 * - Big average rating number
 * - Star display
 * - Horizontal progress bars per rating level
 */
export default function RatingOverview({
  averageRating,
  totalReviews,
  ratingDistribution,
  isLoading,
}: RatingOverviewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col sm:flex-row gap-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 sm:w-40 shrink-0">
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="flex-1 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-8 shrink-0" />
              <Skeleton className="h-2.5 flex-1 rounded-full" />
              <Skeleton className="h-3.5 w-6 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Left: big average */}
      <div className="flex flex-col items-center justify-center gap-2 sm:w-40 shrink-0">
        <p className="text-6xl font-extrabold leading-none text-gray-900 tabular-nums">
          {averageRating > 0 ? averageRating.toFixed(1) : "—"}
        </p>
        <RatingStars rating={averageRating} size={18} />
        <p className="text-xs text-gray-400 text-center">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

      {/* Right: distribution bars */}
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        {STAR_LEVELS.map((star) => {
          const count = ratingDistribution[String(star) as keyof typeof ratingDistribution];
          const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              {/* Star label */}
              <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-500 tabular-nums">
                {star} ★
              </span>

              {/* Progress bar */}
              <div className="flex-1">
                <Progress
                  value={percentage}
                  className="h-2 bg-gray-100 [&>div]:bg-[#facc15] [&>div]:transition-all [&>div]:duration-700"
                  aria-label={`${star} star: ${percentage}%`}
                />
              </div>

              {/* Count */}
              <span className="w-6 shrink-0 text-xs font-medium text-gray-400 tabular-nums">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
