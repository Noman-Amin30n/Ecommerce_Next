"use client";
import React, { startTransition, useEffect, useState } from "react";
import { setItemsPerPageCookie } from "@/actions/filter.action";
import { useFilterContext } from "@/contexts/filterContext";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function ItemsPerPage({
  className,
  defaultValue,
}: {
  className?: string;
  defaultValue?: number;
}) {
  const { itemsPerPage, setItemsPerPage, isApplyingFilter } =
    useFilterContext();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    startTransition(() => setItemsPerPageCookie(defaultValue || 16));
    setItemsPerPage(defaultValue || 16);
    setLoading(false);
  }, [defaultValue, setItemsPerPage]);
  return (
    <>
      {loading ? (
        <ItemsPerPageFallback />
      ) : (
        <input
          type="number"
          className={cn(
            "w-[55px] px-2 min-h-[55px] bg-white text-[#9F9F9F] text-center focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-sm sm:text-base lg:text-[20px]",
            className
          )}
          onKeyDown={(e) => handleShowItemsKeyPress(e)}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          defaultValue={itemsPerPage}
          disabled={isApplyingFilter}
        />
      )}
    </>
  );
}

function ItemsPerPageFallback() {
  return <Skeleton className="self-stretch w-[55px] min-h-[55px]" />;
}

export default ItemsPerPage;

function handleShowItemsKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
  if ((e.target as HTMLInputElement).value.length == 0 && e.key === "0") {
    e.preventDefault();
  } else if (
    (e.target as HTMLInputElement).value.length >= 3 &&
    e.key !== "Backspace" &&
    e.key !== "Delete"
  ) {
    e.preventDefault();
  }
}
