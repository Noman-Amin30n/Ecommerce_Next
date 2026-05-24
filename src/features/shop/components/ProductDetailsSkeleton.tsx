import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailsSkeleton() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12 xl:gap-16 py-6 md:py-10 md:items-start transition-opacity animate-pulse">
      {/* Product Gallery Skeleton */}
      <div className="basis-full md:basis-1/2 flex flex-col-reverse md:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar pb-2 md:pb-0 w-full md:w-24 h-24 md:h-[500px]">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="min-w-[80px] h-[80px] md:w-full md:h-[100px] rounded-xl flex-shrink-0"
            />
          ))}
        </div>

        {/* Main Image */}
        <div className="flex-1 aspect-[3/4] md:aspect-auto md:h-[500px]">
          <Skeleton className="w-full h-full rounded-2xl" />
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div className="basis-full md:basis-1/2 xl:pr-[200px] py-4 md:py-8 space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4 md:w-full" />
          <Skeleton className="h-10 w-1/2" />
        </div>

        {/* Price */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Rating */}
        <div className="flex items-center gap-6 py-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="border-t border-gray-100 pt-8 space-y-8">
          {/* Color Options */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-9 h-9 rounded-full" />
              ))}
            </div>
          </div>

          {/* Size Options */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-12 h-10 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Quantity & Button */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 mt-4">
            <Skeleton className="h-14 w-[120px] rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
