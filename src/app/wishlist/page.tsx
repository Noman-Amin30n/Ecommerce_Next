"use client";

import React from "react";
import PageTitle from "@/components/pageTitle";
import Footer from "@/components/footer";
import Header from "@/components/header/header";
import StoreFeatures from "@/components/storeFeatures";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard_Normal } from "@/components/product_card";
import { Loader2, HeartOff } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { IProduct } from "@/models/product";

export default function WishlistPage() {
  const { wishlistItems, isLoading } = useWishlist();
  const { status } = useSession();

  return (
    <>
      <Header />
      <PageTitle
        title="My Wishlist"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />
      <main className="min-h-[60vh] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {status === "loading" || isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-[#FF5714] mb-4" />
            <p className="text-gray-500">Loading your wishlist...</p>
          </div>
        ) : status === "unauthenticated" ? (
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
            <div className="bg-gray-50 p-6 rounded-full">
              <HeartOff size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Please Log In</h2>
            <p className="text-gray-500 max-w-md">
              You need to be logged in to view your wishlist items.
            </p>
            <Link
              href="/account"
              className="mt-4 px-8 py-3 bg-[#FF5714] text-white rounded-xl font-semibold hover:bg-[#E04D10] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-4">
            <div className="bg-gray-50 p-6 rounded-full">
              <HeartOff size={48} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 max-w-md">
              Seems like you haven&apos;t found anything to love yet. Explore
              our shop and find something special!
            </p>
            <Link
              href="/shop"
              className="mt-4 px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item) => {
              const product = item.product as unknown as IProduct;
              return (
                <div
                  key={String(product._id || item.product)}
                  className="relative group"
                >
                  {/* 
                      We might need to fetch full product details if item.product is just an ID 
                      or if ProductCard needs more props. 
                      Assuming item.product is populated from the API.
                  */}
                  {typeof item.product !== "string" && (
                    <Link href={`/shop/${product.slug}`}>
                      <ProductCard_Normal
                        imageSrc={product.images?.[0] || "/placeholder.png"}
                        imageAlt={product.title}
                        title={product.title}
                        price={product.price?.toString()}
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <StoreFeatures />
      <Footer />
    </>
  );
}
