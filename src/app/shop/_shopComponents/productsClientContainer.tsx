"use client";

import React, { useEffect } from "react";
import { useFilterContext } from "@/contexts/filterContext";
import { ProductCard_NormalSkeleton, ProductCardListSkeleton } from "@/components/product_card";
import { useSearchParams } from "next/navigation";
import { IProduct } from "@/models/product";

type ProductClientContainerProps = {
  children: React.ReactNode;
  products: IProduct[];
};

function ProductsClientContainer({
  children,
  products,
}: ProductClientContainerProps) {
  const { isApplyingFilter, setIsApplyingFilter } =
    useFilterContext();

  // ✅ run once when component mounts
  useEffect(() => {
    setIsApplyingFilter(false);
  }, [products, setIsApplyingFilter]);

  if (isApplyingFilter) {
    return <ProductsContainerFallback />;
  }

  return <>{children}</>;
}

export function ProductsContainerFallback() {
  const searchParams = useSearchParams();
  const productsLayout = searchParams.get("productsLayout") || "grid";

  return (
    <>
      {productsLayout === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 16 }).map((_, index) => (
            <ProductCard_NormalSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 16 }).map((_, index) => (
            <ProductCardListSkeleton key={index} />
          ))}
        </div>
      )}
    </>
  );
}

export default ProductsClientContainer;
