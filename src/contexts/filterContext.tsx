"use client"
import { setIsAPPlyingFilterCookie, setPageCookie } from '@/actions/filter.action';
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useEffect, startTransition } from 'react';

interface FilterContextType {
  priceRangeValue: number;
  setPriceRangeValue: Dispatch<SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: Dispatch<SetStateAction<number>>;
  sortByCurrValue: string;
  setSortByCurrValue: Dispatch<SetStateAction<string>>;
  isApplyingFilter: boolean;
  setIsApplyingFilter: Dispatch<SetStateAction<boolean>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalProducts: number;
  setTotalProducts: Dispatch<SetStateAction<number>>
}

const FilterContext = createContext<FilterContextType | null>(null);

export const FilterContextProvider = ({ children }: { children: ReactNode }) => {
  const [priceRangeValue, setPriceRangeValue] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [sortByCurrValue, setSortByCurrValue] = useState("createdAt");
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  useEffect(() => {
    startTransition(async () => {
      await setPageCookie(1);
      await setIsAPPlyingFilterCookie(false);
    });
  }, [])
  return (
    <FilterContext value={{ priceRangeValue, setPriceRangeValue, itemsPerPage, setItemsPerPage, sortByCurrValue, setSortByCurrValue, isApplyingFilter, setIsApplyingFilter, page, setPage, totalProducts, setTotalProducts }}>
      {children}
    </FilterContext>
  );
};

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};