// src/app/api/reviews/delete/[reviewId]/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Review from "@/models/review";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/errors";
import mongoose from "mongoose";

/**
 * DELETE /api/reviews/delete/[reviewId]
 * Delete a review
 * Requires authentication
 * User can only delete their own reviews
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);

    const { reviewId } = await params;

    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { error: "Invalid review ID" },
        { status: 400 }
      );
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError("Review not found", 404);
    }

    // Check if review belongs to user
    if (review.user.toString() !== session.user.id) {
      throw new ApiError("You can only delete your own reviews", 403);
    }

    // Delete images from Cloudinary if any
    if (review.images && review.images.length > 0) {
      // Delete each image from Cloudinary
      for (const imageUrl of review.images) {
        try {
          await fetch(`/api/upload?imageCloudURL=${imageUrl}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.error("Failed to delete image from Cloudinary:", err);
          // Continue with review deletion even if image deletion fails
        }
      }
    }

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (e) {
    return handleError(e);
  }
}
