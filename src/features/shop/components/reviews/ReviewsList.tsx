"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import ReviewCard from "./ReviewCard";
import type { ClientReview } from "@/types/review";

interface ReviewsListProps {
  reviews: ClientReview[];
  isLoading: boolean;
  error: string | null;
}

/** Skeleton for a single review card while loading */
function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
      </div>
    </div>
  );
}

/** Empty state when there are no reviews yet */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare size={28} className="text-gray-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-700">No reviews yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Be the first to share your experience with this product.
        </p>
      </div>
    </div>
  );
}

/**
 * Renders the list of reviews with loading skeletons and empty state.
 */
export default function ReviewsList({ reviews, isLoading, error }: ReviewsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        Failed to load reviews. Please refresh the page.
      </div>
    );
  }

  if (reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}
