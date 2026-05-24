export default function ChartSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4">
      {/* Chart area skeleton */}
      <div className="h-[300px] w-full relative rounded-xl overflow-hidden">
        {/* Grid lines simulation */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 px-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full border-b border-gray-100/50"></div>
          ))}
        </div>

        {/* Data points simulation */}
        <div className="absolute inset-0 flex items-end justify-between px-1 gap-1">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-100/50 rounded-t-sm"
              style={{
                height: `${20 + Math.random() * 40}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            ></div>
          ))}
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/30 to-transparent"></div>
      </div>

      {/* Stats Summary skeleton */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded-full w-20"></div>
          <div className="h-8 bg-gray-200/80 rounded-lg w-28"></div>
        </div>
        <div className="h-8 bg-gray-100 rounded-full w-20"></div>
      </div>
    </div>
  );
}
