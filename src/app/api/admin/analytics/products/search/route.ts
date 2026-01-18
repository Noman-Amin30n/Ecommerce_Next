import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/app/api/_db";
import { handleError } from "@/lib/errors";
import Product from "@/models/product";

interface ProductQuery {
  isPublished: boolean;
  $text?: { $search: string };
}

export async function GET(request: NextRequest) {
  try {
    await initDb();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: ProductQuery = { isPublished: true };

    // If search term provided, use text search
    if (search) {
      query.$text = { $search: search };
    }

    // Get products with pagination
    const products = await Product.find(query)
      .select("_id title images price createdAt")
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(offset)
      .limit(limit + 1) // Fetch one extra to check if there are more
      .lean();

    // Check if there are more products
    const hasMore = products.length > limit;
    const productsToReturn = hasMore ? products.slice(0, limit) : products;

    // Get total count for the query
    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products: productsToReturn,
      hasMore,
      total,
    });
  } catch (e) {
    return handleError(e);
  }
}
