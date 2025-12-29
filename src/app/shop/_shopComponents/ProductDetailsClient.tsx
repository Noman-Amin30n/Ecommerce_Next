"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProductGallery from "@/components/productGallery";
import RatingStars from "@/components/rating";
import { Loader2 } from "lucide-react";

// Define a type compatible with the Client Component
// We don't import IProduct from models/product.ts because it extends Document which is not serializable
interface ClientVariant {
  sku: string;
  title?: string;
  price: number;
  compareAtPrice?: number;
  color?: string;
  size?: string;
  images?: string[];
  quantity?: number;
}

interface ClientProduct {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  variants: ClientVariant[];
  rating?: number; // Optional as it might not be in DB yet
  reviews?: any[];
}

interface ProductDetailsClientProps {
  product: ClientProduct;
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>(
    product.images[0] || ""
  );
  const [displayedPrice, setDisplayedPrice] = useState<number>(product.price);

  // Extract unique colors and sizes
  const colors = Array.from(
    new Set(product.variants.map((v) => v.color).filter(Boolean))
  ) as string[];
  const sizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean))
  ) as string[];

  // Determine available sizes based on selected color (if specific linkage is needed, otherwise show all)
  // For strict variant logic:
  const availableSizes = selectedColor
    ? Array.from(
        new Set(
          product.variants
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size)
            .filter(Boolean)
        )
      )
    : sizes;

  useEffect(() => {
    // Attempt to select default variant
    if (product.variants.length > 0) {
      if (!selectedColor && colors.length > 0) setSelectedColor(colors[0]);
      if (!selectedSize && sizes.length > 0) setSelectedSize(sizes[0]);
    }
  }, [product.variants, colors, sizes, selectedColor, selectedSize]);

  useEffect(() => {
    // Find matching variant to update price and image
    if (selectedColor && selectedSize) {
      const variant = product.variants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      if (variant) {
        setDisplayedPrice(variant.price);
        if (variant.images && variant.images.length > 0) {
          setCurrentImage(variant.images[0]);
        }
      }
    }
  }, [selectedColor, selectedSize, product.variants]);

  async function addToCart() {
    setLoading(true);
    try {
      // Find the specific variant
      let variantSku,
        variantImage = currentImage;

      // If product has variants, require selection
      if (product.variants.length > 0) {
        const variant = product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );

        if (!variant) {
          alert("Please select a valid Color and Size option.");
          setLoading(false);
          return;
        }
        variantSku = variant.sku;
        if (variant.images && variant.images.length > 0) {
          variantImage = variant.images[0];
        }
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              product: product._id,
              variantSku,
              quantity,
              unitPrice: displayedPrice,
              image: variantImage,
              color: selectedColor,
              size: selectedSize,
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add to cart");
      }

      const data = await res.json();
      console.log("Cart updated:", data);
      alert("Added to cart successfully!");
      router.refresh(); // Refresh to update cart in header if possible
    } catch (error) {
      console.error(error);
      alert("Error adding to cart");
    } finally {
      setLoading(false);
    }
  }

  // Adapter for ProductGallery which expects 'Product' type from types.ts
  // We mock the missing fields for the display component
  const galleryProduct: any = {
    ...product,
    thumbnail: currentImage || product.images[0],
    images: product.images,
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:gap-10 xl:gap-20">
      {/* Product Gallery */}
      <ProductGallery product={galleryProduct} />

      {/* Product Info */}
      <div className="basis-full md:basis-1/2 xl:pr-[200px] py-4 md:py-8">
        <h1 className="text-[28px] md:text-[36px] lg:text-[42px]">
          {product.title}
        </h1>
        <p className="text-[#9F9F9F] font-medium text-lg md:text-xl lg:text-2xl">
          Rs. {displayedPrice}
        </p>

        {/* Product Rating (Mocked if missing) */}
        <div className="flex items-center gap-6 py-4">
          <RatingStars rating={product.rating || 0} size={20} />
          <span className="border-l border-l-[#9F9F9F] self-stretch md:h-[30px] block"></span>
          <span className="text-xs md:text-[13px] text-[#9F9F9F]">
            {product.reviews?.length || 0} Customer Review
          </span>
        </div>

        {/* Product Description */}
        <p className="text-xs md:text-[13px] leading-normal">
          {product.description || "No description available."}
        </p>

        {/* Product Options */}
        <div className="flex flex-col gap-4 mt-4 md:mt-5">
          {/* Color Options */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Color</p>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedColor(color);
                      // Reset size if current size is not available for this color
                      // logic depends on requirements, here keeping simple
                    }}
                    className={`border px-3 py-1 rounded transition-colors ${
                      selectedColor === color
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Options */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Size</p>
              <div className="flex gap-3 flex-wrap">
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(String(size))}
                    className={`border px-3 py-1 rounded transition-colors ${
                      selectedSize === String(size)
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-3 py-1 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button
              onClick={addToCart}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-medium"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? "Adding..." : "Add To Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
