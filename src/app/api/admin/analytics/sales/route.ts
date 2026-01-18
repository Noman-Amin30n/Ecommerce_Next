// src/app/api/admin/analytics/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { initDb } from "@/app/api/_db";
import { handleError } from "@/lib/errors";
import Order from "@/models/order";
import Product from "@/models/product";
import mongoose from "mongoose";

interface SalesDataPoint {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface GroupFormat {
  year: { $year: string };
  month: { $month: string };
  day?: { $dayOfMonth: string };
  hour?: { $hour: string };
}

function getDateRanges(timeRange: string) {
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;
  let groupFormat: GroupFormat;
  let labelFormat: string;

  switch (timeRange) {
    case "today":
      // Last 24 hours, grouped by hour
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
        hour: { $hour: "$createdAt" },
      };
      labelFormat = "hour";
      break;

    case "weekly":
      // Last 7 days, grouped by day
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      labelFormat = "day";
      break;

    case "monthly":
      // Last 30 days, grouped by day
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      labelFormat = "day";
      break;

    case "yearly":
      // Last 12 months, grouped by month
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 12);
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      labelFormat = "month";
      break;

    default:
      // Default to monthly
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      groupFormat = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      labelFormat = "day";
  }

  return { startDate, previousStartDate, groupFormat, labelFormat };
}

export async function GET(request: NextRequest) {
  try {
    await initDb();

    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const timeRange = searchParams.get("timeRange") || "monthly";

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

    const { startDate, previousStartDate, groupFormat } =
      getDateRanges(timeRange);

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
              { $toString: { $year: "$computedCreatedAt" } },
              "-",
              {
                $toString: {
                  $cond: [
                    { $lt: [{ $month: "$computedCreatedAt" }, 10] },
                    {
                      $concat: [
                        "0",
                        { $toString: { $month: "$computedCreatedAt" } },
                      ],
                    },
                    { $toString: { $month: "$computedCreatedAt" } },
                  ],
                },
              },
              ...(groupFormat.day
                ? [
                    "-",
                    {
                      $toString: {
                        $cond: [
                          { $lt: [{ $dayOfMonth: "$computedCreatedAt" }, 10] },
                          {
                            $concat: [
                              "0",
                              {
                                $toString: {
                                  $dayOfMonth: "$computedCreatedAt",
                                },
                              },
                            ],
                          },
                          { $toString: { $dayOfMonth: "$computedCreatedAt" } },
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
                          { $lt: [{ $hour: "$computedCreatedAt" }, 10] },
                          {
                            $concat: [
                              "0",
                              { $toString: { $hour: "$computedCreatedAt" } },
                            ],
                          },
                          { $toString: { $hour: "$computedCreatedAt" } },
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
    const allLabels: { key: string; label: string }[] = [];
    const now = new Date();

    if (timeRange === "today" || timeRange === "daily") {
      for (let i = 0; i < 24; i++) {
        const d = new Date(startDate);
        d.setHours(i);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}-${d.getHours().toString().padStart(2, "0")}`;
        allLabels.push({ key, label: `${d.getHours()}:00` });
      }
    } else if (timeRange === "weekly" || timeRange === "monthly") {
      const days = timeRange === "weekly" ? 7 : 30;
      for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        if (d > now) break;
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
        allLabels.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}` });
      }
    } else if (timeRange === "yearly") {
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i + 1);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        allLabels.push({ key, label: monthNames[d.getMonth()] });
      }
    }

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
