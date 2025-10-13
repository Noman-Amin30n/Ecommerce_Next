"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useFilterContext } from "@/contexts/filterContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";

interface ApplyFilterProps {
  className?: string;
}

export default function ApplyFilter({ className }: ApplyFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    priceRangeValue,
    isApplyingFilter,
    setIsApplyingFilter,
  } = useFilterContext();

  const handleApply = useCallback(async () => {
      setIsApplyingFilter(true);
      const queryParams = new URLSearchParams(searchParams.toString());
      if (queryParams.has("maxPrice")) queryParams.set("maxPrice", priceRangeValue.toString());
      else queryParams.append("maxPrice", priceRangeValue.toString());
      if (queryParams.has("page")) queryParams.set("page", "1");
      else queryParams.append("page", "1");
      router.push(`/shop?${queryParams.toString()}`);
  }, [
    priceRangeValue,
    router,
    searchParams,
    setIsApplyingFilter,
  ]);

  return (
    <button
      type="button"
      onClick={handleApply}
      disabled={isApplyingFilter}
      className={cn(
        "bg-black text-white py-2 px-4 cursor-pointer rounded-sm flex items-center justify-center min-w-[80px]",
        isApplyingFilter && "opacity-75",
        className
      )}
    >
      {isApplyingFilter ? <Loader className="animate-spin" /> : "Apply"}
    </button>
  );
}
