// app/shop/_shopComponents/productsCount.tsx
import React from "react";
import { cookies } from "next/headers";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProductsCount() {
  const cookieStore = await cookies();

  const totalProducts = parseNumber(cookieStore.get("totalProducts")?.value);
  const page = parseNumber(cookieStore.get("page")?.value);
  const itemsPerPage = parseNumber(cookieStore.get("itemsPerPage")?.value);

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
