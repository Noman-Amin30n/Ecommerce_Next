"use client";

import React, { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useFilterContext } from "@/contexts/filterContext";
import { cn } from "@/lib/utils";

interface ItemsPerPageProps {
  className?: string;
  defaultValue?: number;
}

export default function ItemsPerPage({ className, defaultValue = 16 }: ItemsPerPageProps) {
  const router = useRouter();
  const timeOutRef = useRef<NodeJS.Timeout | null>(null);
  const searchParams = useSearchParams();
  const itemsPerPageParam = searchParams.get("itemsPerPage");
  const { totalProducts, isApplyingFilter, setIsApplyingFilter } = useFilterContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? Number(e.target.value) : defaultValue;

    if (value > 0 && value <= totalProducts) {
      setIsApplyingFilter(true);
      if (timeOutRef.current) clearTimeout(timeOutRef.current);
      timeOutRef.current = setTimeout(() => {
        const queryParams = new URLSearchParams(searchParams.toString());
        if (queryParams.has("itemsPerPage")) queryParams.set("itemsPerPage", value.toString());
        else queryParams.append("itemsPerPage", value.toString());
        if (queryParams.has("page")) queryParams.set("page", "1");
        else queryParams.append("page", "1");
        router.push(`/shop?${queryParams.toString()}`);
      }, 2000);
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
      defaultValue={itemsPerPageParam || defaultValue}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      disabled={isApplyingFilter}
    />
  );
}