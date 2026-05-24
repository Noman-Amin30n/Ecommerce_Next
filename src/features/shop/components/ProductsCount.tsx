"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFilterContext } from "@/contexts/filterContext";

export default function ProductsCount({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const { totalProducts } = useFilterContext();
  const page = parseNumber(searchParams?.page ? String(searchParams.page) : "1");
  const itemsPerPage = parseNumber(searchParams?.itemsPerPage ? String(searchParams.itemsPerPage) : "16");

  if (!totalProducts || !page || !itemsPerPage) {
    return <ProductsCountSkeleton />;
  }

  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min(page * itemsPerPage, totalProducts);

  return (
    <p>
      Showing {start}–{end} of {totalProducts} results
    </p>
  );
}

export function ProductsCountSkeleton() {
  return <Skeleton className="w-[200px] h-6" />;
}

// 🔹 Helper to parse cookies safely
function parseNumber(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
