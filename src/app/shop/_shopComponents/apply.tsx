"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useFilterContext } from "@/contexts/filterContext";
import {
  setItemsPerPageCookie,
  setMaxPriceFilterCookie,
  setPageCookie,
  setSortByCookie,
} from "@/actions/filter.action";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

interface ApplyFilterProps {
  className?: string;
}

export default function ApplyFilter({ className }: ApplyFilterProps) {
  const router = useRouter();
  const {
    itemsPerPage,
    priceRangeValue,
    sortByCurrValue,
    isApplyingFilter,
    setIsApplyingFilter,
    setLoading,
  } = useFilterContext();

  const handleApply = useCallback(async () => {
    try {
      setIsApplyingFilter(true);
      setLoading(true);

      // ✅ Run cookie updates in parallel
      await Promise.all([
        setMaxPriceFilterCookie(priceRangeValue),
        setItemsPerPageCookie(itemsPerPage),
        setSortByCookie(sortByCurrValue),
        setPageCookie(1),
      ]);
    } finally {
      router.refresh();
    }
  }, [
    itemsPerPage,
    priceRangeValue,
    sortByCurrValue,
    setIsApplyingFilter,
    setLoading,
    router,
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
