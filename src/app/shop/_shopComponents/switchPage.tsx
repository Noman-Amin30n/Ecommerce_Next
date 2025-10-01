"use client";

import React, { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Product } from "@/typescript/types";
import { useFilterContext } from "@/contexts/filterContext";
import { setPageCookie, setTotalProductsCookie } from "@/actions/filter.action";

interface Props {
  className?: string;
  products: Product[];
  page: number;
  itemsPerPage: number;
}

function SwitchPage({ className, products, page, itemsPerPage }: Props) {
  const router = useRouter();
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const { setPage, setTotalProducts, setIsApplyingFilter } = useFilterContext();

  // ✅ Sync product count once when length changes
  useEffect(() => {
    if (!products.length) return;
    setTotalProducts(products.length);
    setTotalProductsCookie(products.length);
  }, [products.length, setTotalProducts]);

  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (newPage === page) return;
      setIsApplyingFilter(true);
      await setPageCookie(newPage);
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.refresh();
    },
    [page, setPage,setIsApplyingFilter, router]
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
