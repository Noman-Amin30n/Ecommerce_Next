"use client";

import { useEffect } from "react";
import { useFilterContext } from "@/contexts/filterContext";

export function TotalCountUpdaterClient({ total }: { total: number }) {
  const { setTotalProducts } = useFilterContext();

  useEffect(() => {
    setTotalProducts(total);
  }, [total, setTotalProducts]);

  return null;
}
