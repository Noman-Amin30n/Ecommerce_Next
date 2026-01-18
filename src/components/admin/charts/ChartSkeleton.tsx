export default function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>

        {/* Chart area skeleton */}
        <div className="flex items-end justify-between h-48 gap-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t"
              style={{
                height: `${Math.random() * 60 + 40}%`,
                animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Labels skeleton */}
        <div className="flex justify-between">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-8"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
