"use client";

import { useState, useEffect } from "react";
import BaseLineChart from "./BaseLineChart";
import ProductSelector from "./ProductSelector";
import TimeRangeSelector from "./TimeRangeSelector";
import ChartSkeleton from "./ChartSkeleton";
import { ProductSearchResult, SalesAnalytics } from "@/types/analytics.types";
import { TrendingUp, TrendingDown } from "lucide-react";

const TIME_RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function SalesChart() {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSearchResult | null>(null);
  const [timeRange, setTimeRange] = useState("monthly");
  const [chartData, setChartData] = useState<SalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch sales data when product or time range changes
  useEffect(() => {
    if (!selectedProduct) return;

    async function fetchSalesData() {
      if (!selectedProduct) return;
      setLoading(true);
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const params = new URLSearchParams({
          productId: selectedProduct._id,
          timeRange,
          timezone,
        });

        const res = await fetch(`/api/admin/analytics/sales?${params}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setChartData(data);
        }
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSalesData();
  }, [selectedProduct, timeRange]);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Sales Analytics
        </h2>
      </div>

      {/* Product Selector */}
      <ProductSelector
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
      />

      {/* Time Range Selector */}
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        options={TIME_RANGE_OPTIONS}
      />

      {/* Chart */}
      {!selectedProduct ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400">
          <p className="text-sm">Select a product to view sales analytics</p>
        </div>
      ) : loading ? (
        <ChartSkeleton />
      ) : chartData ? (
        <>
          <BaseLineChart
            data={chartData.data}
            labels={chartData.labels}
            title="Sales"
            isPositive={chartData.isPositive}
            loading={loading}
            formatValue={(value) => `${value} units`}
            onlyIntegers={true}
          />

          {/* Stats Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-black">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {chartData.totalSales} units
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
