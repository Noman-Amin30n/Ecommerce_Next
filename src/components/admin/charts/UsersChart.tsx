"use client";

import { useState, useEffect } from "react";
import BaseLineChart from "./BaseLineChart";
import TimeRangeSelector from "./TimeRangeSelector";
import ChartSkeleton from "./ChartSkeleton";
import { UserAnalytics } from "@/types/analytics.types";
import { TrendingUp, TrendingDown } from "lucide-react";

const TIME_RANGE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function UsersChart() {
  const [timeRange, setTimeRange] = useState("monthly");
  const [chartData, setChartData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when time range changes
  useEffect(() => {
    async function fetchUserData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ timeRange });
        const res = await fetch(`/api/admin/analytics/users?${params}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setChartData(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [timeRange]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          User Activity
        </h2>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        options={TIME_RANGE_OPTIONS}
      />

      {/* Chart */}
      {loading ? (
        <ChartSkeleton />
      ) : chartData ? (
        <>
          <BaseLineChart
            data={chartData.data}
            labels={chartData.labels}
            title="New Users"
            isPositive={chartData.isPositive}
            loading={loading}
            formatValue={(value) => `${value} users`}
          />

          {/* Stats Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
                New Users
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {chartData.totalUsers}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                chartData.isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {chartData.isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {chartData.trend}%
            </div>
          </div>
        </>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          <p className="text-sm">No data available</p>
        </div>
      )}
    </div>
  );
}
