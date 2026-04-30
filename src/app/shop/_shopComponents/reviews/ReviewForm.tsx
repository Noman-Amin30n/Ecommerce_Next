"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Lock, CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import StarRatingInput from "./StarRatingInput";
import ImageUploader from "./ImageUploader";
import { useReviewEligibility } from "@/hooks/useReviewEligibility";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReviewFormValues } from "@/types/review";

// Client-side Zod schema (mirrors the server's CreateReviewSchema)
const ReviewFormSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

type ReviewFormData = z.infer<typeof ReviewFormSchema>;

interface ReviewFormProps {
  productId: string;
  productSlug: string;
  onSubmit: (productId: string, values: ReviewFormValues) => Promise<boolean>;
}

/**
 * Gated review submission form.
 * Access control states:
 *  - loading: checking eligibility
 *  - guest: not signed in
 *  - not-eligible: signed in but no delivered order
 *  - already-reviewed: already submitted a review
 *  - form: eligible, show the form
 */
export default function ReviewForm({ productId, productSlug, onSubmit }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const { canReview, hasReviewed, isLoading: eligibilityLoading } = useReviewEligibility(productId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(ReviewFormSchema),
    defaultValues: { rating: 0, title: "", body: "", images: [] },
  });

  // ─── Loading states ───────────────────────────────────────────────────────
  if (status === "loading" || eligibilityLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  // ─── Guest ────────────────────────────────────────────────────────────────
  if (!session?.user) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Lock size={20} className="text-gray-400" />
        </div>
        <div>
          <p className="font-semibold text-gray-700">Sign in to write a review</p>
          <p className="text-sm text-gray-400 mt-0.5">
            You need to be signed in and have purchased this product to leave a review.
          </p>
        </div>
      </div>
    );
  }

  // ─── Already reviewed ─────────────────────────────────────────────────────
  if (hasReviewed || submitted) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={20} className="text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-700">You&apos;ve already reviewed this product</p>
          <p className="text-sm text-green-600/70 mt-0.5">
            Thank you for sharing your experience!
          </p>
        </div>
      </div>
    );
  }

  // ─── Not eligible ─────────────────────────────────────────────────────────
  if (!canReview) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <ShoppingBag size={20} className="text-amber-500" />
        </div>
        <div>
          <p className="font-semibold text-amber-700">Purchase required to review</p>
          <p className="text-sm text-amber-600/70 mt-0.5">
            You can only review products you have ordered and received.
          </p>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────
  const handleFormSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    const success = await onSubmit(productId, {
      rating: data.rating,
      title: data.title ?? "",
      body: data.body ?? "",
      images: data.images ?? [],
    });
    setIsSubmitting(false);
    if (success) {
      reset({ rating: 0, title: "", body: "", images: [] });
      setSubmitted(true);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-5">Write a Review</h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-5">
        {/* Star Rating */}
        <div className="space-y-1.5">
          <Label htmlFor="rating-group" className="text-sm font-semibold text-gray-700">
            Your Rating <span className="text-[#FF5714]">*</span>
          </Label>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRatingInput
                value={field.value}
                onChange={field.onChange}
                size={30}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.rating && (
            <p className="text-xs text-red-500">{errors.rating.message}</p>
          )}
        </div>

        {/* Review Title */}
        <div className="space-y-1.5">
          <Label htmlFor="review-title" className="text-sm font-semibold text-gray-700">
            Review Title
          </Label>
          <Input
            id="review-title"
            placeholder="Sum up your experience in a few words"
            disabled={isSubmitting}
            maxLength={200}
            className="rounded-xl border-gray-200 bg-gray-50 focus:border-[#88D9E6] focus:ring-[#88D9E6] transition-colors"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Review Body */}
        <div className="space-y-1.5">
          <Label htmlFor="review-body" className="text-sm font-semibold text-gray-700">
            Your Review
          </Label>
          <Textarea
            id="review-body"
            placeholder="Tell others what you liked or didn't like about this product…"
            disabled={isSubmitting}
            maxLength={2000}
            rows={4}
            className="resize-none rounded-xl border-gray-200 bg-gray-50 focus:border-[#88D9E6] focus:ring-[#88D9E6] transition-colors"
            {...register("body")}
          />
          {errors.body && (
            <p className="text-xs text-red-500">{errors.body.message}</p>
          )}
        </div>

        {/* Image Upload */}
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader
              slug={productSlug}
              value={field.value || []}
              onChange={field.onChange}
              maxImages={5}
            />
          )}
        />
        {errors.images && (
          <p className="text-xs text-red-500">{errors.images.message}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="relative flex items-center gap-2 bg-[#FF5714] text-white hover:bg-[#f55415] px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </div>
  );
}
