"use client";
import { cn } from "@/lib/utils";
import React, { startTransition, useEffect } from "react";
import { Product } from "@/typescript/types";
import { useFilterContext } from "@/contexts/filterContext";
import { setPageCookie, setTotalProductsCookie } from "@/actions/filter.action";
import { useRouter } from "next/navigation";

interface Props {
  className?: string;
  products: Product[];
  page: number;
  itemsPerPage: number;
}
function SwitchPage({ className, products, page, itemsPerPage }: Props) {
  const router = useRouter();
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const pagesArr = Array.from({ length: totalPages }, (_, index) => index + 1);
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const { setPage, setTotalProducts } = useFilterContext();
  useEffect(() => {
    startTransition(async() => setTotalProductsCookie(products.length));
    setTotalProducts(products.length);
  },[products.length, setTotalProducts]);
  const handlePageChange = async(newPage: number) => {
    await setPageCookie(newPage);
    setPage(newPage);
    window.scrollTo(0, 0);
    router.refresh();
  };

  return (
    <>
      {pagesArr.length > 1 && (
        <div
          className={cn(
            `w-full flex justify-center items-stretch gap-6 mt-9 sm:mt-12 lg:mt-16 ${className}`
          )}
        >
          {hasPrevPage && (
            <button
              className="px-6 flex justify-center items-center rounded-md md:text-[20px] bg-[#FFF9E5]"
              onClick={() => handlePageChange(page - 1)}
            >
              Prev
            </button>
          )}
          {pagesArr.map((item) => (
            <button
              key={item}
              className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-[60px] lg:h-[60px] flex justify-center items-center rounded-md md:text-[20px] ${
                page === item ? "bg-[#FBEBB5]" : "bg-[#FFF9E5]"
              }`}
              onClick={() => handlePageChange(item)}
            >
              {item}
            </button>
          ))}
          {hasNextPage && (
            <button
              className="px-6 flex justify-center items-center rounded-md md:text-[20px] bg-[#FFF9E5]"
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default SwitchPage;
