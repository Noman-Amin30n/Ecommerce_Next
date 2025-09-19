"use client";
import React, { useState, useRef, useEffect } from "react";
import useOutsideClick from "@/hooks/outsideclick";
import { TbAdjustmentsHorizontal } from "react-icons/tb";
import { Product } from "@/typescript/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterContext } from "@/contexts/filterContext";
import { setMaxPriceFilterCookie } from "@/actions/filter.action";
import ShowItemsInput from "./itemsPerPage";
import SortBy from "./sortBy";
import ApplyFilter from "./apply";

function Filters({ productsApiEndpoint }: { productsApiEndpoint: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isApplyingFilter } = useFilterContext();
  const [priceRange, setPriceRange] = useState<{
    minPrice: number;
    maxPrice: number;
  } | null>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch(productsApiEndpoint);
      const products: Product[] = (await res.json()).products;
      const sortedProducts = products.sort((a, b) => a.price - b.price);
      setPriceRange({
        minPrice: sortedProducts[0]?.price || 0,
        maxPrice: sortedProducts[sortedProducts.length - 1]?.price || 0,
      });
    })();
  }, [productsApiEndpoint]);
  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClick(filterRef as React.RefObject<HTMLDivElement>, () =>
    setIsOpen(false)
  );

  return priceRange ? (
    <div className="relative">
      {/* Parent element wrapping the two divs */}
      <div>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => !isApplyingFilter && setIsOpen(!isOpen)}
        >
          <TbAdjustmentsHorizontal className="text-xl sm:text-[25px]" />
          <span className="sm:text-xl">Filter</span>
        </div>
        <div
          className={`absolute top-full left-0 bg-white rounded-md p-4 z-10 ${
            isOpen ? "translate-y-2 scale-y-100" : "scale-y-0"
          } transform origin-top transition-all duration-200 ease-in-out shadow-lg min-w-[250px] max-w-[300px] w-[1000px]`}
          ref={filterRef}
        >
          <PriceFilter
            minPrice={priceRange?.minPrice || 0}
            maxPrice={priceRange?.maxPrice || 0}
          />
          <div className="mt-4 flex lg:hidden items-stretch gap-6 bg-[#FAF4F4] py-2 px-3">
            <div className="flex flex-col justify-between items-stretch gap-[2px]">
              <span className="text-sm sm:text-base font-medium pl-1">
                Show
              </span>
              <ShowItemsInput defaultValue={16} />
            </div>
            <div className="flex flex-col justify-between items-stretch gap-[2px]">
              <span className="text-sm sm:text-base pl-1 font-medium">
                Sort By
              </span>
              <SortBy />
            </div>
          </div>
          <div className="mt-4 lg:hidden">
            <ApplyFilter className="text-sm sm:text-base" />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <FilterFallback />
  );
}

function PriceFilter({
  minPrice,
  maxPrice,
}: {
  minPrice: number;
  maxPrice: number;
}) {
  const { priceRangeValue, setPriceRangeValue, isApplyingFilter } =
    useFilterContext();
  const filterRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    (async () => {
      setPriceRangeValue(maxPrice);
      await setMaxPriceFilterCookie(maxPrice);
    })();
  }, [maxPrice, setPriceRangeValue]);
  useEffect(() => {
    const filterRefCurrent = filterRef.current;
    if (!filterRefCurrent) return;
    const value =
      ((Number(filterRefCurrent.value) - Number(filterRefCurrent.min)) /
        (Number(filterRefCurrent.max) - Number(filterRefCurrent.min))) *
      100;
    filterRefCurrent.style.background = `linear-gradient(to right, #fb923c 0%, #fb923c ${value}%, #fed7aa ${value}%, #fed7aa 100%)`;
  }, [filterRef, priceRangeValue]);

  return (
    <div>
      <span className="text-sm sm:text-base font-medium">Price</span>
      <div className="flex justify-between items-center gap-4 text-xs sm:text-sm mt-2">
        <span>${minPrice}</span>
        <span>${priceRangeValue}</span>
      </div>
      <input
        type="range"
        ref={filterRef}
        className="w-[100%] appearance-none price-range rounded-[999px] bg-orange-200"
        min={minPrice}
        max={maxPrice}
        step={1}
        value={priceRangeValue}
        onChange={(e) => setPriceRangeValue(Number(e.target.value))}
        disabled={isApplyingFilter}
      />
    </div>
  );
}

export function FilterFallback() {
  return (
    <Skeleton className="self-stretch w-[66px] sm:w-[80px] rounded-none" />
  );
}

export default Filters;
