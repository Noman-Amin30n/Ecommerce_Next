// Public API for product listing and details
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Product from "@/models/product";
import { handleError, ApiError } from "@/lib/errors";
import { allowRequest } from "@/lib/rateLimiter";

export async function GET(req: Request) {
  try {
    if (!allowRequest(req.headers.get("x-forwarded-for") ?? "unknown")) {
      throw new ApiError("Too many requests", 429);
    }
    await connectMongoose();
    const url = new URL(req.url);
    
    // Check if requesting by slug
    const slug = url.searchParams.get("slug");
    if (slug) {
      const product = await Product.findOne({ slug, isPublished: true })
        .populate("category", "name")
        .lean();
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json(product);
    }
    
    // Otherwise, list products
    const q = url.searchParams.get("q") ?? "";
    const category = url.searchParams.get("category") ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));
    const skip = (page - 1) * limit;
    
    const filter: Record<string, unknown> = { isPublished: true };
    if (q) {
      filter.$text = { $search: q };
    }
    if (category) {
      filter.category = category;
    }
    
    const [items, count] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);
    
    return NextResponse.json({ items, count, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
