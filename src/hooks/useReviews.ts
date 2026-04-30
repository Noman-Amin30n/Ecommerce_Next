"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { ClientReview, ReviewFormValues, ReviewsApiResponse } from "@/types/review";

interface UseReviewsReturn {
  reviews: ClientReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: ReviewsApiResponse["ratingDistribution"];
  isLoading: boolean;
  error: string | null;
  submitReview: (productId: string, values: ReviewFormValues) => Promise<boolean>;
}

const DEFAULT_DIST: ReviewsApiResponse["ratingDistribution"] = {
  "5": 0, "4": 0, "3": 0, "2": 0, "1": 0,
};

export function useReviews(productId: string): UseReviewsReturn {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState(DEFAULT_DIST);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/${productId}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data: ReviewsApiResponse = await res.json();
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
      setRatingDistribution(data.ratingDistribution);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /**
   * Optimistically submit a review.
   * Returns true on success, false on failure.
   */
  const submitReview = useCallback(
    async (productId: string, values: ReviewFormValues): Promise<boolean> => {
      // Build optimistic review object
      const optimisticReview: ClientReview = {
        _id: `optimistic-${Date.now()}`,
        product: productId,
        user: null,
        rating: values.rating,
        title: values.title,
        body: values.body,
        images: values.images,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically prepend the review
      setReviews((prev) => [optimisticReview, ...prev]);
      setTotalReviews((prev) => prev + 1);

      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: productId, ...values }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Submission failed");
        }

        const { review: savedReview } = await res.json();

        // Replace optimistic entry with real saved review
        setReviews((prev) =>
          prev.map((r) => (r._id === optimisticReview._id ? savedReview : r))
        );

        // Re-fetch to get accurate stats
        fetchReviews();
        toast.success("Review submitted successfully!");
        return true;
      } catch (err) {
        // Roll back optimistic update
        setReviews((prev) => prev.filter((r) => r._id !== optimisticReview._id));
        setTotalReviews((prev) => prev - 1);
        const msg = err instanceof Error ? err.message : "Failed to submit review";
        toast.error(msg);
        return false;
      }
    },
    [fetchReviews]
  );

  return {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    error,
    submitReview,
  };
}
