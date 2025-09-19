import Footer from "@/components/footer";
import Header from "@/components/header/header";
import React, { Suspense } from "react";
import PageTitle from "@/components/pageTitle";
import ItemsPerPage from "./_shopComponents/itemsPerPage";
import SortBy from "./_shopComponents/sortBy";
import Filters from "./_shopComponents/filters";
import { FilterContextProvider } from "@/contexts/filterContext";
import ApplyFilter from "./_shopComponents/apply";
import ProductsLayout from "./_shopComponents/productsLayout";
import ProductsContainer from "./_shopComponents/productsGrid";
import { ProductsContainerFallback } from "./_shopComponents/productsClientContainer";
import ProductsCount, { ProductsCountSkeleton } from "./_shopComponents/productsCount";

async function Shop() {
  const productsApiEndpoint = "https://dummyjson.com/products";

  return (
    <>
      <FilterContextProvider>
        <Header className="bg-white sticky top-0 z-[998]" />
        {/* Page title */}
        <PageTitle
          title="Shop"
          backgroundImageUrl="/images/pageTitleBg.jpg"
          logoImageUrl="/images/pageTitleLogo.png"
        />
        {/* Filters */}
        <section className="mt-8 bg-[#FAF4F4] py-5">
          <div className="max-w-[1440px] mx-auto px-6 flex flex-col justify-between items-stretch gap-4 lg:flex-row">
            <div className="flex flex-row justify-between items-stretch sm:items-center gap-5 md:gap-6">
              <div className="text-sm sm:text-base text-center order-1">
                <Suspense fallback={<ProductsCountSkeleton />}>
                  <ProductsCount />
                </Suspense>
              </div>
              <div className="flex justify-between items-center gap-5 md:gap-6 lg:pr-6 lg:border-r-2 lg:border-[#9F9F9F]">
                <Filters productsApiEndpoint={productsApiEndpoint} />
                <div className="hidden sm:flex justify-between items-center gap-5 md:gap-6">
                  <ProductsLayout />
                </div>
              </div>
            </div>
            <div className="hidden lg:flex justify-between items-stretch gap-6 text-xl">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <ItemsPerPage defaultValue={16} />
              </div>
              <div className={`flex items-center gap-2`}>
                <span>Sort by</span>
                <SortBy />
              </div>
              <ApplyFilter />
            </div>
          </div>
        </section>
        {/* Products */}
        <section className="w-full max-w-[1440px] px-6 mx-auto py-9 sm:py-12 lg:py-16">
          <Suspense fallback={<ProductsContainerFallback />}>
            <ProductsContainer APIEndpoint={productsApiEndpoint}/>
          </Suspense>
        </section>
        <Footer />
      </FilterContextProvider>
    </>
  );
}

export default Shop;
