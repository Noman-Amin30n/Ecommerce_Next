import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Product from "@/models/product";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Return empty results for empty query
    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    await connectMongoose();

    // Use MongoDB text search with score sorting
    const products = await Product.find(
      {
        $text: { $search: query },
        isPublished: true,
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .select("title slug price images")
      .lean();

    // Transform results
    const results = products.map((product) => ({
      _id: product._id.toString(),
      title: product.title,
      slug: product.slug,
      price: product.price,
      thumbnail: product.images?.[0] || "",
    }));

    return NextResponse.json({ products: results });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    );
  }
}
