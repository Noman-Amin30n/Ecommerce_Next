"use server"

import { canUserReviewProduct, getUserReviewForProduct } from "@/lib/reviewHelpers/server";

export async function canUserReviewProductAction(
  userId: string,
  productId: string
) {
  return canUserReviewProduct(userId, productId);
}

export async function getUserReviewForProductAction(
  userId: string,
  productId: string
) {
  return getUserReviewForProduct(userId, productId);
}