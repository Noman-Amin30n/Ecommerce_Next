// src/app/api/reviews/[productId]/route.ts
import { NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import Review, { IReview } from "@/models/review";
import { handleError } from "@/lib/errors";
import { calculateRatingStats } from "@/lib/reviewHelpers/client";
import mongoose from "mongoose";

/**
 * GET /api/reviews/[productId]
 * Get all reviews for a specific product with rating statistics
 * Returns:
 * - reviews: array of review documents
 * - averageRating: precise decimal average (e.g., 4.37)
 * - totalReviews: total count
 * - ratingDistribution: counts for each star level (5, 4, 3, 2, 1)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await initDb();
    const { productId } = await params;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Fetch all reviews for this product
    const reviews = await Review.find({
      product: new mongoose.Types.ObjectId(productId),
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate rating statistics
    const stats = calculateRatingStats(reviews as IReview[]);

    return NextResponse.json({
      ...stats,
      reviews,
    });
  } catch (e) {
    return handleError(e);
  }
}
