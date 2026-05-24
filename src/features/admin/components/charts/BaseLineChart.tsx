"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import ChartSkeleton from "./ChartSkeleton";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface BaseLineChartProps {
  data: number[];
  labels: string[];
  title: string;
  isPositive: boolean;
  loading?: boolean;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
  onlyIntegers?: boolean;
}

export default function BaseLineChart({
  data,
  labels,
  title,
  isPositive,
  loading = false,
  yAxisLabel = "",
  formatValue = (value) => value.toString(),
  onlyIntegers = false,
}: BaseLineChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  // Determine color based on trend
  const lineColor = isPositive ? "#10b981" : "#ef4444"; // green : red

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
      gradient.addColorStop(
        0,
        isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
      );
      gradient.addColorStop(
        1,
        isPositive ? "rgba(16, 185, 129, 0)" : "rgba(239, 68, 68, 0)",
      );

      if (chart.data.datasets[0]) {
        chart.data.datasets[0].backgroundColor = gradient;
        chart.update("none");
      }
    }
  }, [isPositive, data]);

  if (loading) {
    return <ChartSkeleton />;
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: lineColor,
        backgroundColor: isPositive
          ? "rgba(16, 185, 129, 0.1)"
          : "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: lineColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return formatValue(context.parsed.y ?? 0);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            weight: 600 as const,
          },
          color: "#9ca3af",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        ticks: {
          font: {
            size: 11,
            weight: 600 as const,
          },
          color: "#9ca3af",
          precision: onlyIntegers ? 0 : undefined,
          callback: function (value) {
            return formatValue(Number(value));
          },
        },
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: {
            size: 12,
            weight: "bold",
          },
          color: "#6b7280",
        },
      },
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="w-full h-[300px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
