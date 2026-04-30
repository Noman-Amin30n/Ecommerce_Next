"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { CanReviewApiResponse } from "@/types/review";

interface UseReviewEligibilityReturn {
  canReview: boolean;
  hasReviewed: boolean;
  isLoading: boolean;
}

/**
 * Checks whether the currently authenticated user can submit a review
 * for a given product. Only fetches if user is authenticated.
 */
export function useReviewEligibility(productId: string): UseReviewEligibilityReturn {
  const { data: session, status } = useSession();
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkEligibility = useCallback(async () => {
    if (!productId || status === "loading") return;

    // Guest users: skip the API call
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/reviews/can-review?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to check review eligibility");
      const data: CanReviewApiResponse = await res.json();
      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
    } catch {
      // Silently fail — form will just be hidden
      setCanReview(false);
    } finally {
      setIsLoading(false);
    }
  }, [productId, session, status]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  return { canReview, hasReviewed, isLoading };
}
