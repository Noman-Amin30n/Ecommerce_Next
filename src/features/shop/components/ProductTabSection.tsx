"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Star } from "lucide-react";
import DescriptionTab from "./tabs/DescriptionTab";
import ReviewsTab from "./tabs/ReviewsTab";

interface ClientProduct {
  _id: string;
  slug: string;
  description?: string;
  reviews?: { rating: number }[];
}

interface ProductTabSectionProps {
  product: ClientProduct;
}

/**
 * Root product detail tab section rendered below the product gallery + info.
 * Contains two tabs: Description and Reviews.
 */
export default function ProductTabSection({ product }: ProductTabSectionProps) {
  const reviewCount = product.reviews?.length ?? 0;

  return (
    <section
      className="w-full py-10 md:py-14"
      aria-label="Product details tabs"
    >
      <Tabs defaultValue="description" className="w-full">
        {/* Tab triggers */}
        <TabsList
          className={`
            relative mb-8 h-auto w-full rounded-none border-b border-gray-100 bg-transparent p-0
            flex gap-0 justify-start
          `}
        >
          <TabsTrigger
            value="description"
            className={`
              group relative flex items-center gap-2 rounded-none border-b-2 border-transparent
              bg-transparent px-6 py-3.5 text-sm font-semibold text-gray-500 transition-all duration-200
              hover:text-gray-800
              data-[state=active]:border-[#FF5714] data-[state=active]:text-[#FF5714]
              data-[state=active]:bg-transparent
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5714] focus-visible:ring-offset-2
            `}
          >
            <FileText
              size={16}
              className="transition-transform duration-200 group-data-[state=active]:scale-110"
            />
            Description
          </TabsTrigger>

          <TabsTrigger
            value="reviews"
            className={`
              group relative flex items-center gap-2 rounded-none border-b-2 border-transparent
              bg-transparent px-6 py-3.5 text-sm font-semibold text-gray-500 transition-all duration-200
              hover:text-gray-800
              data-[state=active]:border-[#FF5714] data-[state=active]:text-[#FF5714]
              data-[state=active]:bg-transparent
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5714] focus-visible:ring-offset-2
            `}
          >
            <Star
              size={16}
              className="transition-transform duration-200 group-data-[state=active]:scale-110"
            />
            Reviews
            {/* Review count badge */}
            {reviewCount > 0 && (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FAF4F4] px-1.5 text-[10px] font-bold text-gray-500 group-data-[state=active]:bg-orange-50 group-data-[state=active]:text-[#FF5714] transition-colors">
                {reviewCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Description Tab Content */}
        <TabsContent
          value="description"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <DescriptionTab description={product.description} />
        </TabsContent>

        {/* Reviews Tab Content */}
        <TabsContent
          value="reviews"
          className="mt-0 focus-visible:outline-none focus-visible:ring-0"
        >
          <ReviewsTab productId={product._id} productSlug={product.slug} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
