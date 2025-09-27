"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  startTransition,
} from "react";
import { setPageCookie } from "@/actions/filter.action";

// Define the shape of the context

interface FilterContextType {
  priceRangeValue: number;
  setPriceRangeValue: (value: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  sortByCurrValue: string;
  setSortByCurrValue: (value: string) => void;
  isApplyingFilter: boolean;
  setIsApplyingFilter: (value: boolean) => void;
  page: number;
  setPage: (value: number) => void;
  totalProducts: number;
  setTotalProducts: (value: number) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterContextProvider({ children }: { children: ReactNode }) {
  const [priceRangeValue, _setPriceRangeValue] = useState(0);
  const [itemsPerPage, _setItemsPerPage] = useState(16);
  const [sortByCurrValue, _setSortByCurrValue] = useState("createdAt");
  const [isApplyingFilter, _setIsApplyingFilter] = useState(false);
  const [loading, _setLoading] = useState(true);
  const [page, _setPage] = useState(1);
  const [totalProducts, _setTotalProducts] = useState(0);

  // ✅ Wrap setters in useCallback to prevent unnecessary re-renders
  const setPriceRangeValue = useCallback(
    (v: number) => _setPriceRangeValue(v),
    []
  );
  const setItemsPerPage = useCallback((v: number) => _setItemsPerPage(v), []);
  const setSortByCurrValue = useCallback(
    (v: string) => _setSortByCurrValue(v),
    []
  );
  const setIsApplyingFilter = useCallback(
    (v: boolean) => _setIsApplyingFilter(v),
    []
  );
  const setLoading = useCallback((v: boolean) => _setLoading(v), []);
  const setPage = useCallback((v: number) => _setPage(v), []);
  const setTotalProducts = useCallback((v: number) => _setTotalProducts(v), []);

  const value: FilterContextType = {
    priceRangeValue,
    setPriceRangeValue,
    itemsPerPage,
    setItemsPerPage,
    sortByCurrValue,
    setSortByCurrValue,
    isApplyingFilter,
    setIsApplyingFilter,
    page,
    setPage,
    totalProducts,
    setTotalProducts,
    loading,
    setLoading,
  };

  useEffect(() => {
    startTransition(async () => {
      await setPageCookie(page);
    });
  }, [page]);

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
