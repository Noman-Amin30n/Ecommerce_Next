"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CartItem } from "@/contexts/CartContext";

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  currency?: string;
  shipping?: number;
  tax?: number;
}

export function CheckoutSummary({ items, subtotal, currency = "USD", shipping = 0, tax = 0 }: CheckoutSummaryProps) {
  const total = subtotal + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm sticky top-24">
      <h2 className="text-xl font-semibold mb-6 border-b pb-4">Order Summary</h2>
      
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
        {items.map((item, i) => {
          const title = typeof item.product === "object" ? item.product.title : "Product";
          const imageUrl = item.image || (typeof item.product === "object" && item.product.images?.[0]) || "https://placehold.co/150x150/png";
          
          return (
            <div key={i} className="flex gap-4">
              <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0 border">
                <Image src={imageUrl} alt={title} fill className="object-cover" />
                <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full z-10">
                  {item.quantity}
                </div>
              </div>
              <div className="flex flex-col flex-grow text-sm">
                <span className="font-medium line-clamp-2">{title}</span>
                <span className="text-gray-500">
                  {item.color?.label} {item.size ? `/ ${item.size}` : ''}
                </span>
                <span className="font-semibold mt-auto">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
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
      
      <div className="flex justify-between items-center">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
