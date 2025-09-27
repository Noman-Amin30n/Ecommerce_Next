"use client";

import React, { useRef, useState, useEffect, startTransition, useCallback } from "react";
import { FaAngleDown } from "react-icons/fa6";
import { Skeleton } from "@/components/ui/skeleton";
import useOutsideClick from "@/hooks/outsideclick";
import { setSortByCookie } from "@/actions/filter.action";
import { useFilterContext } from "@/contexts/filterContext";
import clsx from "clsx";

type SortOption = {
  label: string;
  value: string;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "Title", value: "title" },
  { label: "Price", value: "price" },
  { label: "Rating", value: "rating" },
  { label: "Newest", value: "createdAt" },
];

export default function SortBy() {
  const { sortByCurrValue, setSortByCurrValue, isApplyingFilter } = useFilterContext();
  const [isOpen, setIsOpen] = useState(false);

  const sortByRef = useRef<HTMLDivElement>(null);
  useOutsideClick(sortByRef as React.RefObject<HTMLDivElement>, () => setIsOpen(false));

  // ✅ Sync cookie whenever sort value changes
  useEffect(() => {
    if (sortByCurrValue) {
      startTransition(() => setSortByCookie(sortByCurrValue));
    }
  }, [sortByCurrValue]);

  const handleSelect = useCallback(
    (value: string) => {
      setSortByCurrValue(value);
      setIsOpen(false);
    },
    [setSortByCurrValue]
  );

  if (!sortByCurrValue) return <SortByFallback />;

  const currentOption = SORT_OPTIONS.find((opt) => opt.value === sortByCurrValue);

  return (
    <div className="relative isolate" ref={sortByRef}>
      <button
        type="button"
        disabled={isApplyingFilter}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex justify-between items-center gap-4 cursor-pointer text-[#9F9F9F] bg-white min-h-[55px] px-8 w-full"
      >
        <span className="text-sm sm:text-base lg:text-[20px]">
          {currentOption?.label ?? "Sort"}
        </span>
        <FaAngleDown className="text-sm sm:text-base" />
      </button>

      <div
        className={clsx(
          "absolute right-0 top-full bg-white text-[#9F9F9F] flex flex-col cursor-pointer origin-top transition-all duration-300 ease-in-out transform opacity-0 scale-y-0 z-10",
          isOpen && "scale-y-100 translate-y-1 opacity-100 border-l-[3px] shadow-lg border-[#fbebb5]"
        )}
      >
        {SORT_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className="px-8 py-2 text-left hover:bg-blue-50 hover:text-black text-sm sm:text-base lg:text-[20px] transition-all duration-200 ease-in-out"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortByFallback() {
  return <Skeleton className="self-stretch w-[170px] min-h-[55px]" />;
}