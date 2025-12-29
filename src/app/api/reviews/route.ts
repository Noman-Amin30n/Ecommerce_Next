import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Review from "@/models/review";
import User from "@/models/user";
import { CreateReviewSchema } from "@/lib/validators/review";
import { getSessionForRequest, requireAuth } from "@/lib/auth";
import { handleError, ApiError } from "@/lib/errors";
import { canUserReviewProduct, getUserReviewForProduct } from "@/lib/reviewHelpers/server";
import mongoose from "mongoose";

/**
 * GET /api/reviews
 * Get all reviews with optional filters
 * Query params:
 * - productId: filter by product
 * - userId: filter by user
 * - limit: pagination limit (default 20)
 * - skip: pagination offset (default 0)
 */
export async function GET(req: NextRequest) {
  try {
    await connectMongoose();

    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Build query
    const query: Record<string, unknown> = {};
    if (productId) {
      query.product = new mongoose.Types.ObjectId(productId);
    }
    if (userId) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    // Fetch reviews
    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate("product", "title images")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + reviews.length < total,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * POST /api/reviews
 * Create a new review
 * Requires authentication
 * Validates:
 * - User has not already reviewed this product
 * - User has ordered the product and it was delivered
 */
export async function POST(req: Request) {
  try {
    await connectMongoose();
    const session = await getSessionForRequest();
    requireAuth(session);

    const body = await req.json();
    const parsed = CreateReviewSchema.parse(body);

    const userId = session.user.id;
    const productId = parsed.product;

    // Check if user already reviewed this product
    const existingReview = await getUserReviewForProduct(userId, productId);
    if (existingReview) {
      throw new ApiError("You have already reviewed this product", 400);
    }

    // Check if user has ordered and received this product
    const canReview = await canUserReviewProduct(userId, productId);
    if (!canReview) {
      throw new ApiError(
        "You can only review products you have ordered and received",
        403
      );
    }

    // Get user details for denormalization
    const user = await User.findById(userId);

    // Create review
    const review = await Review.create({
      product: new mongoose.Types.ObjectId(productId),
      user: new mongoose.Types.ObjectId(userId),
      userName: (user?.name || session.user.name) || undefined,
      userEmail: (user?.email || session.user.email) || undefined,
      rating: parsed.rating,
      title: parsed.title,
      body: parsed.body,
      images: parsed.images || [],
    });

    // Populate product and user for response
    await review.populate("product", "title images");
    await review.populate("user", "name email");

    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    return handleError(e);
  }
}
