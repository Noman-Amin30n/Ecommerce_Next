"use client";

import React, { useEffect } from "react";
import { useFilterContext } from "@/contexts/filterContext";
import { ProductCard_NormalSkeleton } from "@/components/product_card";
import { Product } from "@/typescript/types";

type ProductClientContainerProps = {
  children: React.ReactNode;
  products: Product[];
  skeletonCount?: number; // make fallback configurable
};

function ProductsClientContainer({
  children,
  skeletonCount = 16,
  products,
}: ProductClientContainerProps) {
  const { isApplyingFilter, setIsApplyingFilter, loading, setLoading } = useFilterContext();

  // ✅ run once when component mounts
  useEffect(() => {
    setLoading(false);
    setIsApplyingFilter(false);
    // console.table({ isApplyingFilter, loading, productsLength: products.length });
  }, [products, setIsApplyingFilter, setLoading]);

  if (loading || isApplyingFilter) {
    return <ProductsContainerFallback count={skeletonCount} />;
  }

  return <>{children}</>;
}

export function ProductsContainerFallback({ count = 16 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCard_NormalSkeleton key={index} />
      ))}
    </div>
  );
}

export default ProductsClientContainer;
