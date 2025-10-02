"use client";

import React, { startTransition, useEffect } from "react";
import { setItemsPerPageCookie, setPageCookie } from "@/actions/filter.action";
import { useFilterContext, getCookie } from "@/contexts/filterContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ItemsPerPageProps {
  className?: string;
  defaultValue?: number;
}

export default function ItemsPerPage({ className, defaultValue = 16 }: ItemsPerPageProps) {
  const { itemsPerPage, setItemsPerPage, isApplyingFilter, setIsApplyingFilter, totalProducts, setPage } = useFilterContext();

  // ✅ Initialize once
  useEffect(() => {
    setItemsPerPage(getCookie("itemsPerPage") ? Number(getCookie("itemsPerPage")) : defaultValue);
    if (!getCookie("itemsPerPage")) {
      startTransition(() => setItemsPerPageCookie(defaultValue));
    }
  }, [defaultValue, setItemsPerPage]);

  if (itemsPerPage === undefined || totalProducts === undefined) return <ItemsPerPageFallback />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (value > 0 && value <= totalProducts) {
      startTransition(() => {
        setItemsPerPageCookie(value);
        setPageCookie(1);
      });
      setItemsPerPage(value);
      setIsApplyingFilter(true);
      setPage(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const length = input.value.length;

    if (length === 0 && e.key === "0") {
      e.preventDefault();
    } else if (length >= 3 && !["Backspace", "Delete"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <input
      type="number"
      className={cn(
        "w-[55px] px-2 min-h-[55px] bg-white text-[#9F9F9F] text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-sm sm:text-base lg:text-[20px]",
        className
      )}
      value={itemsPerPage}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      disabled={isApplyingFilter}
    />
  );
}

function ItemsPerPageFallback() {
  return <Skeleton className="self-stretch w-[55px] min-h-[55px]" />;
}
