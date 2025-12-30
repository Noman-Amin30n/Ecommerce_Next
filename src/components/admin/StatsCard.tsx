// src/components/admin/StatsCard.tsx
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  className = "",
}: StatsCardProps) {
  // Determine color theme based on title or icon
  const getTheme = () => {
    const t = title.toLowerCase();
    if (t.includes("revenue") || t.includes("sales"))
      return "from-emerald-500 to-teal-600 shadow-emerald-500/20 text-emerald-600 bg-emerald-50";
    if (t.includes("order"))
      return "from-blue-500 to-indigo-600 shadow-blue-500/20 text-blue-600 bg-blue-50";
    if (t.includes("user"))
      return "from-purple-500 to-pink-600 shadow-purple-500/20 text-purple-600 bg-purple-50";
    return "from-orange-500 to-red-600 shadow-orange-500/20 text-orange-600 bg-orange-50";
  };

  const themeClasses = getTheme();
  const iconColors = themeClasses.split(" ")[2];
  const iconBg = themeClasses.split(" ")[3];

  return (
    <div
      className={`group relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600 transition-colors">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </p>
          </div>

          {trend && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                trend.isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-gray-400 font-medium ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>

        <div
          className={`p-3 rounded-xl ${iconBg} ${iconColors} shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      {/* Subtle indicator line matching the theme */}
      <div
        className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${themeClasses
          .split(" ")
          .slice(0, 2)
          .join(
            " "
          )} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
    </div>
  );
}
