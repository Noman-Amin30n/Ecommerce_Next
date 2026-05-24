"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CartItemCardProps {
  index: number;
  item: CartItem;
  currency?: string;
}

export function CartItemCard({ index, item, currency = "USD" }: CartItemCardProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (updating) return;

    setUpdating(true);
    try {
      // Check inventory
      const productId = typeof item.product === "string" ? item.product : item.product._id;
      const res = await fetch(`/api/inventory/check?productId=${productId}${item.variantSku ? `&variantSku=${item.variantSku}` : ""}`);
      const data = await res.json();

      if (data.available !== undefined && newQuantity > data.available) {
        toast.error(`Only ${data.available} items available in stock.`);
        setUpdating(false);
        return;
      }

      await updateQuantity(index, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const title = typeof item.product === "object" ? item.product.title : "Product";
  
  // Use a fallback placeholder image if none provided
  const imageUrl = item.image || (typeof item.product === "object" && item.product.images?.[0]) || "https://placehold.co/150x150/png";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg bg-white relative">
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-col flex-grow w-full gap-1">
        <div className="flex justify-between items-start w-full">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <p className="font-bold whitespace-nowrap ml-4">{formatPrice(item.unitPrice * item.quantity)}</p>
        </div>

        <div className="text-sm text-gray-500 flex flex-col gap-0.5">
          {item.color && (
            <p className="flex items-center gap-2">
              Color: 
              <span 
                className="w-3 h-3 rounded-full border border-gray-300" 
                style={{ backgroundColor: item.color.value }} 
                title={item.color.label}
              />
              {item.color.label}
            </p>
          )}
          {item.size && <p>Size: {item.size}</p>}
          <p>{formatPrice(item.unitPrice)} each</p>
        </div>

        <div className="flex items-center justify-between mt-2 w-full">
          <div className="flex items-center border rounded-md overflow-hidden h-9">
            <button
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1 || updating}
              className="px-3 h-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Minus size={14} />
            </button>
            <div className="w-10 text-center font-medium text-sm flex items-center justify-center h-full">
              {updating ? "..." : item.quantity}
            </div>
            <button
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={updating}
              className="px-3 h-full bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFromCart(index)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} className="mr-2" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
