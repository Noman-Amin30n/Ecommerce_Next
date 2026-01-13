"use client";

import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useFilterContext } from "@/contexts/filterContext";

interface Props {
  className?: string;
  totalItems: number;
}

function SwitchPage({ className, totalItems }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const itemsPerPage = Number(searchParams.get("itemsPerPage") || 16);
  const { setIsApplyingFilter } = useFilterContext();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Note: Total count update is now handled by TotalCountUpdaterClient in parent

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (newPage === page) return;
      setIsApplyingFilter(true);
      const queryParams = new URLSearchParams(searchParams.toString());
      if (queryParams.has("page")) queryParams.set("page", newPage.toString());
      else queryParams.append("page", newPage.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.push(`/shop?${queryParams.toString()}`);
    },
    [page, router, searchParams, setIsApplyingFilter]
  );

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "w-full flex justify-center items-stretch gap-2 mt-9 sm:mt-12 lg:mt-16",
        className
      )}
    >
      {/* Prev */}
      {page > 1 && (
        <button
          onClick={() => handlePageChange(page - 1)}
          className="px-4 md:px-6 flex justify-center items-center rounded-md md:text-[20px] bg-[#FFF9E5]"
          aria-label="Previous page"
        >
          Prev
        </button>
      )}

      {/* Page numbers */}
      {getVisiblePages(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 md:px-3">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => handlePageChange(Number(p))}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-[60px] lg:h-[60px] flex justify-center items-center rounded-md md:text-[20px]",
              page === p ? "bg-[#FBEBB5]" : "bg-[#FFF9E5]"
            )}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      {page < totalPages && (
        <button
          onClick={() => handlePageChange(page + 1)}
          className="px-4 md:px-6 flex justify-center items-center rounded-md md:text-[20px] bg-[#FFF9E5]"
          aria-label="Next page"
        >
          Next
        </button>
      )}
    </div>
  );
}

export default SwitchPage;

/**
 * Utility: show a limited set of pages with ellipsis
 */
function getVisiblePages(
  current: number,
  total: number,
  delta: number = 2
): (number | string)[] {
  const range = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  if (current - delta > 2) {
    range.unshift("...");
  }
  if (current + delta < total - 1) {
    range.push("...");
  }

  range.unshift(1);
  if (total > 1) range.push(total);

  return range;
}
