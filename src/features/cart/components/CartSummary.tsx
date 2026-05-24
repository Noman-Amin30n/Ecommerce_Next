"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { calculateShipping } from "@/lib/pricing-utils";
import { CartItem } from "@/contexts/CartContext";

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  currency?: string;
  tax?: number;
}

export function CartSummary({ items, subtotal, currency = "PKR", tax = 0 }: CartSummaryProps) {
  const router = useRouter();
  const shipping = calculateShipping(items.map(item => ({
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    isFreeShipping: typeof item.product === "object" ? item.product.isFreeShipping : false
  })));
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Estimated Shipping</span>
          <span className="font-medium">{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
        </div>
        
        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Tax</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
        )}
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between items-center mb-6">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold">{formatPrice(total)}</span>
      </div>
      
      <Button 
        className="w-full h-12 text-base font-medium rounded-lg bg-black hover:bg-gray-800 transition-colors"
        onClick={() => router.push("/checkout")}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}
