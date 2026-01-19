import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { initDb } from "@/app/api/_db";
import { handleError } from "@/lib/errors";
import Order from "@/models/order";
import { getDateRanges, generateLabels } from "@/lib/analytics-utils";

interface OrderDataPoint {
  _id: string;
  count: number;
}

export async function GET(request: NextRequest) {
  try {
    await initDb();

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "monthly";
    const timezone = searchParams.get("timezone") || "UTC";

    const { startDate, previousStartDate, groupFormat } = getDateRanges(
      timeRange,
      timezone,
    );

    // Build aggregation pipeline for current period
    const currentPeriodData: OrderDataPoint[] = await Order.aggregate([
      {
        $addFields: {
          computedCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          computedCreatedAt: { $gte: startDate },
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
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build aggregation pipeline for previous period (for trend calculation)
    const previousPeriodData = await Order.aggregate([
      {
        $addFields: {
          computedCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
        },
      },
      {
        $match: {
          computedCreatedAt: { $gte: previousStartDate, $lt: startDate },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // Generate all expected labels for zero-filling
    const allLabels = generateLabels(timeRange, startDate, timezone);

    // Map aggregated data to the complete label set
    const dataMap = new Map(
      currentPeriodData.map((item) => [item._id, item.count]),
    );
    const labels = allLabels.map((l) => l.label);
    const data = allLabels.map((l) => dataMap.get(l.key) || 0);

    const totalOrders = currentPeriodData.reduce(
      (sum, item) => sum + item.count,
      0,
    );
    const previousTotalOrders = previousPeriodData[0]?.count || 0;

    // Calculate trend
    let trend = 0;
    if (previousTotalOrders > 0) {
      trend = ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100;
    } else if (totalOrders > 0) {
      trend = 100;
    }

    const isPositive = trend >= 0;

    return NextResponse.json({
      labels,
      data,
      trend: Math.abs(Math.round(trend * 10) / 10),
      isPositive,
      totalOrders,
    });
  } catch (e) {
    return handleError(e);
  }
}
