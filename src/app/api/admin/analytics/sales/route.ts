import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { initDb } from "@/app/api/_db";
import { handleError } from "@/lib/errors";
import Order from "@/models/order";
import Product from "@/models/product";
import mongoose from "mongoose";
import { getDateRanges, generateLabels } from "@/lib/analytics-utils";

interface SalesDataPoint {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
}

export async function GET(request: NextRequest) {
  try {
    await initDb();

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const timeRange = searchParams.get("timeRange") || "monthly";
    const timezone = searchParams.get("timezone") || "UTC";

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { startDate, previousStartDate, groupFormat } = getDateRanges(
      timeRange,
      timezone,
    );

    // Build aggregation pipeline for current period
    const currentPeriodData: SalesDataPoint[] = await Order.aggregate([
      {
        $addFields: {
          computedCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          computedCreatedAt: { $gte: startDate },
          status: { $in: ["paid", "shipped", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.product": new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: {
            $concat: [
              { $toString: groupFormat.year },
              "-",
              {
                $toString: {
                  $cond: [
                    { $lt: [groupFormat.month, 10] },
                    { $concat: ["0", { $toString: groupFormat.month }] },
                    { $toString: groupFormat.month },
                  ],
                },
              },
              ...(groupFormat.day
                ? [
                    "-",
                    {
                      $toString: {
                        $cond: [
                          { $lt: [groupFormat.day, 10] },
                          { $concat: ["0", { $toString: groupFormat.day }] },
                          { $toString: groupFormat.day },
                        ],
                      },
                    },
                  ]
                : []),
              ...(groupFormat.hour
                ? [
                    "-",
                    {
                      $toString: {
                        $cond: [
                          { $lt: [groupFormat.hour, 10] },
                          { $concat: ["0", { $toString: groupFormat.hour }] },
                          { $toString: groupFormat.hour },
                        ],
                      },
                    },
                  ]
                : []),
            ],
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build aggregation pipeline for previous period (for trend calculation)
    const previousPeriodData: SalesDataPoint[] = await Order.aggregate([
      {
        $addFields: {
          computedCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          computedCreatedAt: { $gte: previousStartDate, $lt: startDate },
          status: { $in: ["paid", "shipped", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.product": new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
    ]);

    // Generate all expected labels for zero-filling
    const allLabels = generateLabels(timeRange, startDate, timezone);

    // Map aggregated data to the complete label set
    const dataMap = new Map(
      currentPeriodData.map((item) => [item._id, item.totalQuantity]),
    );
    const labels = allLabels.map((l) => l.label);
    const data = allLabels.map((l) => dataMap.get(l.key) || 0);

    const totalSales = currentPeriodData.reduce(
      (sum, item) => sum + item.totalQuantity,
      0,
    );
    const previousTotalSales = previousPeriodData[0]?.totalQuantity || 0;

    // Calculate trend
    let trend = 0;
    if (previousTotalSales > 0) {
      trend = ((totalSales - previousTotalSales) / previousTotalSales) * 100;
    } else if (totalSales > 0) {
      trend = 100;
    }

    const isPositive = trend >= 0;

    return NextResponse.json({
      labels,
      data,
      trend: Math.abs(Math.round(trend * 10) / 10),
      isPositive,
      totalSales,
      productId,
      productTitle: product.title,
    });
  } catch (e) {
    return handleError(e);
  }
}
