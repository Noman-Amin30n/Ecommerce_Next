"use client";
import React from "react";
import { TbLayoutGridFilled } from "react-icons/tb";
import { TfiLayoutListThumbAlt } from "react-icons/tfi";
import { useRouter, useSearchParams } from "next/navigation";

function ProductsLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productsLayout = searchParams.get("productsLayout") || "grid";

  const handleProductsLayout = async (layout: string) => {
    if (layout === "grid") {
      const queryParams = new URLSearchParams(searchParams.toString());
      if(queryParams.has("productsLayout")){
        queryParams.set("productsLayout", "grid");
      } else {
        queryParams.append("productsLayout", "grid");
      }
      router.push(`/shop?${queryParams.toString()}`);
    } else {
      const queryParams = new URLSearchParams(searchParams.toString());
      if(queryParams.has("productsLayout")){
        queryParams.set("productsLayout", "list");
      } else {
        queryParams.append("productsLayout", "list");
      }
      router.push(`/shop?${queryParams.toString()}`);
    }
  };

  return (
    <>
      <div
        className="relative isolate"
        onClick={() => handleProductsLayout("grid")}
      >
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full box-content p-[2px] rounded-sm ${
            productsLayout === "grid" ? "bg-orange-300" : ""
          } -z-10`}
        ></span>
        <TbLayoutGridFilled
          className={`text-xl sm:text-[25px] ${
            productsLayout === "grid" ? "text-green-700" : ""
          } cursor-pointer`}
        />
      </div>
      <div
        className="relative isolate"
        onClick={() => handleProductsLayout("list")}
      >
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full box-content p-[2px] rounded-sm ${
            productsLayout === "list" ? "bg-orange-300" : ""
          } -z-10`}
        ></span>
        <TfiLayoutListThumbAlt
          className={`text-xl sm:text-[25px] ${
            productsLayout === "list" ? "text-green-700" : ""
          } cursor-pointer`}
        />
      </div>
    </>
  );
}

export default ProductsLayout;
