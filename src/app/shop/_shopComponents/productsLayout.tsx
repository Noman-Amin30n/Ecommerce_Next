"use client";
import React, { useState, useEffect, startTransition } from "react";
import { TbLayoutGridFilled } from "react-icons/tb";
import { TfiLayoutListThumbAlt } from "react-icons/tfi";
import { setProductsLayoutCookie } from "@/actions/filter.action";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getCookie } from "@/contexts/filterContext";

function ProductsLayout() {
  const router = useRouter();
  const [Layout, setLayout] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getCookie("productsLayout")) {
      startTransition(() => setProductsLayoutCookie("grid"));
    } else {
      setLayout(getCookie("productsLayout") || "grid");
    }
    setIsLoading(false);
    router.refresh();
  }, [router]);

  const handleProductsLayout = async (layout: string) => {
    if (layout === "grid") {
      setLayout("grid");
      startTransition(() => setProductsLayoutCookie("grid"));
      router.refresh();
    } else {
      setLayout("list");
      startTransition(() => setProductsLayoutCookie("list"));
      router.refresh();
    }
  };

  return (
    <>
      {isLoading ? (
        productsLayoutFallback()
      ) : (
        <>
          <div
            className="relative isolate"
            onClick={() => handleProductsLayout("grid")}
          >
            <span
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full box-content p-[2px] rounded-sm ${
                Layout === "grid" ? "bg-orange-300" : ""
              } -z-10`}
            ></span>
            <TbLayoutGridFilled
              className={`text-xl sm:text-[25px] ${
                Layout === "grid" ? "text-green-700" : ""
              } cursor-pointer`}
            />
          </div>
          <div
            className="relative isolate"
            onClick={() => handleProductsLayout("list")}
          >
            <span
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full box-content p-[2px] rounded-sm ${
                Layout === "list" ? "bg-orange-300" : ""
              } -z-10`}
            ></span>
            <TfiLayoutListThumbAlt
              className={`text-xl sm:text-[25px] ${
                Layout === "list" ? "text-green-700" : ""
              } cursor-pointer`}
            />
          </div>
        </>
      )}
    </>
  );
}

function productsLayoutFallback() {
  return (
    <>
      <Skeleton className="self-stretch w-[29px] h-[29px] rounded-sm" />
      <Skeleton className="self-stretch w-[29px] h-[29px] rounded-sm" />
    </>
  );
}

export default ProductsLayout;
