import React from "react";
import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";

async function ProductsCount() {
  const cookieStore = await cookies();
  const totalProducts = Number(cookieStore.get("totalProducts")?.value);
  const page = Number(cookieStore.get("page")?.value);
  const itemsPerPage = Number(cookieStore.get("itemsPerPage")?.value);
  return (
    <>
      {isNaN(totalProducts) || isNaN(page) || isNaN(itemsPerPage) ? (
        <ProductsCountSkeleton />
      ) : (
        <p>
          Showing {page * itemsPerPage - itemsPerPage + 1}-
          {page * itemsPerPage > totalProducts
            ? totalProducts
            : page * itemsPerPage}{" "}
          of {totalProducts} results
        </p>
      )}
    </>
  );
}

export function ProductsCountSkeleton() {
  return <Skeleton className="w-[200px] h-6" />;
}

export default ProductsCount;
