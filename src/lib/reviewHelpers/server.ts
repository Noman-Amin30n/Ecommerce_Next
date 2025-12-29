import "server-only";
import mongoose from "mongoose";
import Order from "@/models/order";
import Review, { IReview } from "@/models/review";

/**
 * Check if a user can review a product
 * User must have ordered the product and it must have been delivered
 */
export async function canUserReviewProduct(
  userId: string | mongoose.Types.ObjectId,
  productId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  const order = await Order.findOne({
    user: userId,
    status: "delivered",
    "items.product": productId,
  });

  return !!order;
}

/**
 * Get a user's existing review for a product
 */
export async function getUserReviewForProduct(
  userId: string | mongoose.Types.ObjectId,
  productId: string | mongoose.Types.ObjectId
): Promise<IReview | null> {
  const review = await Review.findOne({
    user: userId,
    product: productId,
  });

  return review;
}