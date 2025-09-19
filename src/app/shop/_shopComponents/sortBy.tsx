"use client";
import React, { useRef, useState, useEffect, startTransition } from "react";
import useOutsideClick from "@/hooks/outsideclick";
import { FaAngleDown } from "react-icons/fa6";
import { setSortByCookie } from "@/actions/filter.action";
import { useFilterContext } from "@/contexts/filterContext";
import { Skeleton } from "@/components/ui/skeleton";

function SortBy() {
  const { sortByCurrValue, setSortByCurrValue, isApplyingFilter } =
    useFilterContext();
  const [toggleSortByOptions, setToggleSortByOptions] = useState(false);
  const [loading, setLoading] = useState(true);
  const sortByRef = useRef<HTMLDivElement>(null);
  useOutsideClick(sortByRef as React.RefObject<HTMLDivElement>, () =>
    setToggleSortByOptions(false)
  );
  useEffect(() => {
    startTransition(async () => await setSortByCookie(sortByCurrValue));
    setLoading(false);
  }, []);

  return (
    <>
      {loading ? (
        <SortByFallback />
      ) : (
        <div className="relative isolate" ref={sortByRef}>
          <div
            className="flex justify-between items-center gap-4 cursor-pointer text-[#9F9F9F] bg-white min-h-[55px] px-8"
            onClick={() =>
              !isApplyingFilter && setToggleSortByOptions(!toggleSortByOptions)
            }
          >
            <span className="text-sm sm:text-base lg:text-[20px]">
              {sortByCurrValue === "createdAt"
                ? "Newest"
                : sortByCurrValue.charAt(0).toUpperCase() +
                  sortByCurrValue.slice(1)}
            </span>
            <span>
              <FaAngleDown className="text-sm sm:text-base" />
            </span>
          </div>
          <div
            className={`absolute right-0 top-full bg-white text-[#9F9F9F] flex flex-col cursor-pointer z-[-1] scale-y-0 origin-top opacity-0 ${
              toggleSortByOptions &&
              "scale-y-100 translate-y-[4px] opacity-100 border-l-[3px] shadow-lg border-[#fbebb5]"
            } transition-all duration-300 ease-in-out`}
          >
            {["title", "price", "rating", "newest"].map((label) => (
              <span
                key={label}
                onClick={(e) =>
                  handleSortByCurrValue(
                    e,
                    setSortByCurrValue,
                    setToggleSortByOptions
                  )
                }
                className="px-8 py-2 hover:bg-blue-50 hover:text-black text-sm sm:text-base lg:text-[20px] transition-all duration-200 ease-in-out"
              >
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default SortBy;

function SortByFallback() {
  return <Skeleton className="self-stretch w-[170px] min-h-[55px]" />;
}

function handleSortByCurrValue(
  e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  setSortByCurrValue: React.Dispatch<React.SetStateAction<string>>,
  setToggleSortByOptions?: React.Dispatch<React.SetStateAction<boolean>>
) {
  const target = e.target as HTMLSpanElement;
  if (target && target.tagName === "SPAN") {
    const value = target.innerText.toLowerCase();
    switch (value) {
      case "title":
        setSortByCurrValue("title");
        break;
      case "price":
        setSortByCurrValue("price");
        break;
      case "rating":
        setSortByCurrValue("rating");
        break;
      case "newest":
        setSortByCurrValue("createdAt");
        break;
    }
    if (setToggleSortByOptions) {
      setToggleSortByOptions(false);
    }
  }
}
