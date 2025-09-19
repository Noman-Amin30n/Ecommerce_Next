"use client";
import { useFilterContext } from "@/contexts/filterContext";
import { ProductCard_NormalSkeleton } from "@/components/product_card";
import React from "react";

function ProductClientContainer({ children }: { children: React.ReactNode }) {
  const { isApplyingFilter } = useFilterContext();
  return <>{isApplyingFilter ? <ProductsContainerFallback /> : children}</>;
}

export function ProductsContainerFallback() {
  const numbersArr = Array.from({ length: 16 }, (_, index) => index);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {numbersArr.map((index) => (
        <div
          key={index}
        >
          <ProductCard_NormalSkeleton />
        </div>
      ))}
    </div>
  );
}

export default ProductClientContainer;
