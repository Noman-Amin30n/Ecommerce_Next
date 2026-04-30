import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import { getSessionForRequest } from "@/lib/auth";
import { canUserReviewProduct, getUserReviewForProduct } from "@/lib/reviewHelpers/server";
import { handleError } from "@/lib/errors";

/**
 * GET /api/reviews/can-review?productId=<id>
 * Returns whether the authenticated user can review the product.
 * - canReview: user has a delivered order containing this product
 * - hasReviewed: user has already submitted a review for this product
 */
export async function GET(req: NextRequest) {
  try {
    await initDb();

    const productId = req.nextUrl.searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const session = await getSessionForRequest();
    if (!session?.user?.id) {
      // Guest — neither eligible nor already reviewed
      return NextResponse.json({ canReview: false, hasReviewed: false });
    }

    const userId = session.user.id;

    const [canReview, existingReview] = await Promise.all([
      canUserReviewProduct(userId, productId),
      getUserReviewForProduct(userId, productId),
    ]);

    return NextResponse.json({
      canReview: canReview && !existingReview,
      hasReviewed: !!existingReview,
    });
  } catch (e) {
    return handleError(e);
  }
}
