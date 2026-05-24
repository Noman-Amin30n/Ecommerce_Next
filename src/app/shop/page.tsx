// app/shop/page.tsx
import React, { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import PageTitle from "@/components/common/PageTitle";
import { FilterContextProvider } from "@/contexts/filterContext";

// Shop feature components
import ItemsPerPage from "@/features/shop/components/ItemsPerPage";
import SortBy from "@/features/shop/components/SortBy";
import Filters from "@/features/shop/components/Filters";
import ProductsLayout from "@/features/shop/components/ProductsLayout";
import ProductsContainer from "@/features/shop/components/ProductsGrid";
import { ProductsContainerFallback } from "@/features/shop/components/ProductsClientContainer";
import ProductsCount from "@/features/shop/components/ProductsCount";
import StoreFeatures from "@/components/common/StoreFeatures";

export const metadata: Metadata = {
  title: "Shop",
  description: "Welcome to our online store",
};

import Category from "@/models/category";
import { connectMongoose } from "@/lib/mongoose";
import Product from "@/models/product";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  await connectMongoose();

  // Fetch min and max price for filters
  const priceStats = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  const minPrice =
    priceStats.length > 0 ? Math.floor(priceStats[0].minPrice) : 0;
  const maxPrice =
    priceStats.length > 0 ? Math.ceil(priceStats[0].maxPrice) : 0;

  // Fetch all categories and serialize for Client Component props
  const categories = JSON.parse(JSON.stringify(await Category.find({}).lean()));

  return (
    <>
      <Header className="bg-white sticky top-0 z-[997] isolate" />

      {/* Page title */}
      <PageTitle
        title="Shop"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />

      <FilterContextProvider>
        {/* Filters + Controls */}
        <main className="mt-8 bg-[#FAF4F4] px-6 py-5">
          <section className="max-w-[1440px] mx-auto flex flex-col lg:flex-row justify-between items-stretch gap-4">
            {/* Left Controls */}
            <section className="flex flex-row sm:items-center gap-5 md:gap-6">
              <div className="text-sm sm:text-base text-center order-1">
                <ProductsCount searchParams={resolvedSearchParams} />
              </div>

              <div className="flex items-center gap-5 md:gap-6 lg:pr-6 lg:border-r-2 lg:border-[#9F9F9F]">
                {/* Pass DB-fetched stats to Filters */}
                <Filters
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  categories={categories}
                />
                <div className="hidden sm:flex items-center gap-5 md:gap-6">
                  <ProductsLayout />
                </div>
              </div>
            </section>

            {/* Right Controls */}
            <section className="hidden lg:flex items-center gap-6 text-xl">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <ItemsPerPage defaultValue={16} />
              </div>
              <div className="flex items-center gap-2">
                <span>Sort by</span>
                <SortBy />
              </div>
            </section>
          </section>
        </main>

        {/* Products Grid */}
        <main className="px-6">
          <section className="w-full max-w-[1440px] mx-auto py-9 sm:py-12 lg:py-16">
            <Suspense fallback={<ProductsContainerFallback />}>
              <ProductsContainer searchParams={resolvedSearchParams} />
            </Suspense>
          </section>
        </main>

        {/* Store Features */}
        <StoreFeatures />
      </FilterContextProvider>

      <Footer />
    </>
  );
}
