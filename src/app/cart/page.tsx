"use client";

import React from "react";
import { useCart } from "@/contexts/CartContext";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import PageTitle from "@/components/pageTitle";
import StoreFeatures from "@/components/storeFeatures";

export default function CartPage() {
  const { cartItems, cartCount, subtotal, loading } = useCart();

  if (loading) {
    return (
      <>
        <Header className="bg-white sticky top-0 z-[997] isolate" />
        <PageTitle title="Cart" backgroundImageUrl="/images/pageTitleBg.jpg" logoImageUrl="/images/pageTitleLogo.png" />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
            <div className="lg:w-1/3">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </main>
        <StoreFeatures />
        <Footer />
      </>
    );
  }

  if (cartCount === 0) {
    return (
      <>
        <Header className="bg-white sticky top-0 z-[997] isolate" />
        <PageTitle title="Cart" backgroundImageUrl="/images/pageTitleBg.jpg" logoImageUrl="/images/pageTitleLogo.png" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
          <div className="flex justify-center mb-6 text-gray-300">
            <ShoppingBag size={80} strokeWidth={1} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven&apos;t added anything to your cart yet. Browse our products and find something you love!
          </p>
          <Link href="/shop">
            <Button size="lg" className="px-8">
              Start Shopping
            </Button>
          </Link>
        </main>
        <StoreFeatures />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header className="bg-white sticky top-0 z-[997] isolate" />
      <PageTitle title="Cart" backgroundImageUrl="/images/pageTitleBg.jpg" logoImageUrl="/images/pageTitleLogo.png" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart <span className="text-gray-500 text-xl font-normal ml-2">({cartCount} {cartCount === 1 ? 'item' : 'items'})</span></h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="lg:w-2/3 w-full flex flex-col gap-4">
            {cartItems.map((item, index) => (
              <CartItemCard
                key={`${typeof item.product === "string" ? item.product : item.product._id}-${item.variantSku}-${item.size}-${item.color?.value}-${index}`}
                index={index}
                item={item}
              />
            ))}
          </div>
          
          <div className="lg:w-1/3 w-full">
            <CartSummary subtotal={subtotal} />
          </div>
        </div>
      </main>
      <StoreFeatures />
      <Footer />
    </>
  );
}
