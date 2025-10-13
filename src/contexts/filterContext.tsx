"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";

// Define the shape of the context

interface FilterContextType {
  priceRangeValue: number;
  setPriceRangeValue: (value: number) => void;
  totalProducts: number;
  setTotalProducts: (value: number) => void;
  isApplyingFilter: boolean;
  setIsApplyingFilter: (value: boolean) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterContextProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();

  // ✅ Initialize state from URL search params or default values
  const [priceRangeValue, _setPriceRangeValue] = useState(
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 0
  );
  const [isApplyingFilter, _setIsApplyingFilter] = useState(false);
  const [totalProducts, _setTotalProducts] = useState(0);

  // ✅ Wrap setters in useCallback to prevent unnecessary re-renders
  const setPriceRangeValue = useCallback(
    (v: number) => _setPriceRangeValue(v),
    []
  );
  const setIsApplyingFilter = useCallback(
    (v: boolean) => _setIsApplyingFilter(v),
    []
  );
  const setTotalProducts = useCallback((v: number) => _setTotalProducts(v), []);

  const value: FilterContextType = {
    priceRangeValue,
    setPriceRangeValue,
    isApplyingFilter,
    setIsApplyingFilter,
    totalProducts,
    setTotalProducts,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilterContext() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error(
      "useFilterContext must be used within a FilterContextProvider"
    );
  }
  return ctx;
}
