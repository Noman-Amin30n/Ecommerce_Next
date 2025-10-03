// app/shop/page.tsx
import React, { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import PageTitle from "@/components/pageTitle";
import { FilterContextProvider } from "@/contexts/filterContext";

// Shop subcomponents
import ItemsPerPage from "./_shopComponents/itemsPerPage";
import SortBy from "./_shopComponents/sortBy";
import Filters from "./_shopComponents/filters";
import ProductsLayout from "./_shopComponents/productsLayout";
import ProductsContainer from "./_shopComponents/productsGrid";
import { ProductsContainerFallback } from "./_shopComponents/productsClientContainer";
import ProductsCount, { ProductsCountSkeleton } from "./_shopComponents/productsCount";
import StoreFeatures from "@/components/storeFeatures";

export const metadata: Metadata = {
  title: "Shop",
  description: "Welcome to our online store",
};

const productsAPI = process.env.NEXT_PUBLIC_PRODUCTS_API || "https://dummyjson.com/products?limit=70";

export default async function ShopPage() {
  return (
    <>
      <Header className="bg-white sticky top-0 z-[998]" />

      {/* Page title */}
      <PageTitle
        title="Shop"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />

      <FilterContextProvider>
        {/* Filters + Controls */}
        <section className="mt-8 bg-[#FAF4F4] py-5">
          <div className="max-w-[1440px] mx-auto px-6 flex flex-col lg:flex-row justify-between items-stretch gap-4">
            {/* Left Controls */}
            <div className="flex flex-row sm:items-center gap-5 md:gap-6">
              <div className="text-sm sm:text-base text-center order-1">
                <Suspense fallback={<ProductsCountSkeleton />}>
                  <ProductsCount />
                </Suspense>
              </div>

              <div className="flex items-center gap-5 md:gap-6 lg:pr-6 lg:border-r-2 lg:border-[#9F9F9F]">
                <Filters productsApiEndpoint={productsAPI} />
                <div className="hidden sm:flex items-center gap-5 md:gap-6">
                  <ProductsLayout />
                </div>
              </div>
            </div>

            {/* Right Controls */}
            <div className="hidden lg:flex items-center gap-6 text-xl">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <ItemsPerPage defaultValue={16} />
              </div>
              <div className="flex items-center gap-2">
                <span>Sort by</span>
                <SortBy />
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="w-full max-w-[1440px] px-6 mx-auto py-9 sm:py-12 lg:py-16">
          <Suspense fallback={<ProductsContainerFallback />}>
            <ProductsContainer APIEndpoint={productsAPI} />
          </Suspense>
        </section>

        {/* Store Features */}
        <StoreFeatures />
      </FilterContextProvider>
      
      <Footer />
    </>
  );
}
