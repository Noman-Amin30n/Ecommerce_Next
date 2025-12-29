"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterContext } from "@/contexts/filterContext";
import useOutsideClick from "@/hooks/outsideclick";
import ShowItemsInput from "./itemsPerPage";
import SortBy from "./sortBy";
import ApplyFilter from "./apply";
import clsx from "clsx";
// import { Product } from "@/typescript/types";
import { useSearchParams } from "next/navigation";

interface FiltersProps {
  productsApiEndpoint?: string; // Kept for compatibility but unused for fetching
  minPrice: number;
  maxPrice: number;
}

interface PriceRange {
  minPrice: number;
  maxPrice: number;
}

export default function Filters({ minPrice, maxPrice }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isApplyingFilter } = useFilterContext();
  // const [priceRange, setPriceRange] = useState<PriceRange | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClick(filterRef as React.RefObject<HTMLDivElement>, () =>
    setIsOpen(false)
  );

  // No internal fetching anymore

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => !isApplyingFilter && setIsOpen((prev) => !prev)}
      >
        <TbAdjustmentsHorizontal className="text-xl sm:text-[25px]" />
        <span className="sm:text-xl">Filter</span>
      </div>

      <div
        ref={filterRef}
        className={clsx(
          "absolute top-full left-0 bg-white rounded-md p-4 z-10 shadow-lg min-w-[250px] max-w-[300px] w-[1000px] transform origin-top transition-all duration-200 ease-in-out",
          isOpen ? "translate-y-2 scale-y-100" : "scale-y-0"
        )}
      >
        <PriceFilter minPrice={minPrice} maxPrice={maxPrice} />

        {/* Mobile-only filters */}
        <div className="mt-4 flex lg:hidden items-stretch gap-6 bg-[#FAF4F4] py-2 px-3">
          <div className="flex flex-col gap-[2px]">
            <span className="text-sm sm:text-base font-medium pl-1">Show</span>
            <ShowItemsInput defaultValue={16} />
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="text-sm sm:text-base font-medium pl-1">
              Sort By
            </span>
            <SortBy />
          </div>
        </div>

        <div className="mt-4">
          <ApplyFilter className="text-sm sm:text-base" />
        </div>
      </div>
    </div>
  );
}

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
}

function PriceFilter({ minPrice, maxPrice }: PriceFilterProps) {
  const { priceRangeValue, setPriceRangeValue } = useFilterContext();
  const sliderRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // ✅ Initialize max price filter once
  useEffect(() => {
    setPriceRangeValue(
      searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : maxPrice
    );
  }, [maxPrice, setPriceRangeValue, searchParams]);

  // ✅ Update slider background dynamically
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const value =
      ((Number(slider.value) - Number(slider.min)) /
        (Number(slider.max) - Number(slider.min))) *
      100;
    slider.style.background = `linear-gradient(to right, #fb923c 0%, #fb923c ${value}%, #fed7aa ${value}%, #fed7aa 100%)`;
  }, [priceRangeValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPriceRangeValue(Number(e.target.value));
    },
    [setPriceRangeValue]
  );

  return (
    <div>
      <span className="text-sm sm:text-base font-medium">Price</span>
      <div className="flex justify-between items-center gap-4 text-xs sm:text-sm mt-2">
        <span>${minPrice}</span>
        <span>${priceRangeValue}</span>
      </div>
      <input
        type="range"
        ref={sliderRef}
        className="w-full appearance-none price-range rounded-full bg-orange-200"
        min={minPrice}
        max={maxPrice}
        step={1}
        value={priceRangeValue}
        onChange={handleChange}
      />
    </div>
  );
}

export function FilterFallback() {
  return (
    <Skeleton className="self-stretch w-[66px] sm:w-[80px] rounded-none" />
  );
}
