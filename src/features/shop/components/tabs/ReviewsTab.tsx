"use client";

import React from "react";
import RatingOverview from "../reviews/RatingOverview";
import ReviewForm from "../reviews/ReviewForm";
import ReviewsList from "../reviews/ReviewsList";
import { useReviews } from "@/hooks/useReviews";
import type { ReviewFormValues } from "@/types/review";

interface ReviewsTabProps {
  productId: string;
  productSlug: string;
}

/**
 * Orchestrates the entire reviews experience:
 * - Rating overview stats
 * - Gated review submission form
 * - Paginated reviews list
 */
export default function ReviewsTab({ productId, productSlug }: ReviewsTabProps) {
  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    error,
    submitReview,
  } = useReviews(productId);

  const handleSubmit = async (id: string, values: ReviewFormValues) => {
    return submitReview(id, values);
  };

  return (
    <div className="space-y-8">
      {/* Rating Statistics Overview */}
      <section aria-label="Rating overview">
        <RatingOverview
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
          isLoading={isLoading}
        />
      </section>

      {/* Review Submission Form (access-gated) */}
      <section aria-label="Write a review">
        <ReviewForm
          productId={productId}
          productSlug={productSlug}
          onSubmit={handleSubmit}
        />
      </section>

      {/* Divider */}
      {(totalReviews > 0 || isLoading) && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-gray-400">
            {isLoading ? "Reviews" : `${totalReviews} Review${totalReviews !== 1 ? "s" : ""}`}
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
      )}

      {/* Reviews List */}
      <section aria-label="Customer reviews">
        <ReviewsList reviews={reviews} isLoading={isLoading} error={error} />
      </section>
    </div>
  );
}
