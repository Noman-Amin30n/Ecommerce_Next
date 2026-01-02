"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ProductGallery from "@/components/productGallery";
import RatingStars from "@/components/rating";
import { Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

// Define a type compatible with the Client Component
// We don't import IProduct from models/product.ts because it extends Document which is not serializable
interface ClientSizeVariant {
  size: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  quantity?: number;
}

interface ClientVariant {
  color: {
    label: string;
    value: string;
  };
  images: string[];
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  sizes: ClientSizeVariant[];
}

interface ClientReview {
  _id?: string;
  rating: number;
  comment?: string;
  userName?: string;
  userEmail?: string;
  createdAt?: string | Date;
}

interface ClientProduct {
  _id: string;
  title: string;
  description?: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: ClientVariant[];
  rating?: number;
  reviews?: ClientReview[];
  colors?: {
    label: string;
    value: string;
  }[];
}

interface ProductDetailsClientProps {
  product: ClientProduct;
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const { data: session } = useSession();
  const [selectedColor, setSelectedColor] = useState<string>(""); // Store hex value
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>(
    product.images[0] || ""
  );
  const [displayedPrice, setDisplayedPrice] = useState<number>(product.price);
  const [displayedComparePrice, setDisplayedComparePrice] = useState<
    number | undefined
  >(product.compareAtPrice);
  const { addToCart: addToCartContext, cartItems } = useCart();

  // Extract unique colors and all available sizes across all variants
  const colors = product.variants.map((v) => v.color).filter(Boolean);

  const allSizes = Array.from(
    new Set(product.variants.flatMap((v) => v.sizes.map((s) => s.size)))
  );

  // Determine available sizes based on selected color
  const selectedVariant = product.variants.find(
    (v) => v.color.value === selectedColor
  );

  const availableSizes = selectedVariant
    ? selectedVariant.sizes.map((s) => s.size)
    : allSizes;

  useEffect(() => {
    // Attempt to select default variant on mount
    if (product.variants.length > 0) {
      if (!selectedColor && colors.length > 0)
        setSelectedColor(colors[0].value);
    }
  }, [product.variants, colors, selectedColor]);

  // Handle automatic size switch when color changes
  useEffect(() => {
    if (selectedColor) {
      const currentVariant = product.variants.find(
        (v) => v.color.value === selectedColor
      );

      if (
        currentVariant &&
        currentVariant.sizes &&
        currentVariant.sizes.length > 0
      ) {
        // If current selected size is not in the new color's sizes, pick the first one
        const isSizeAvailable = currentVariant.sizes.some(
          (s) => s.size === selectedSize
        );
        if (!isSizeAvailable) {
          setSelectedSize(currentVariant.sizes[0].size);
        }
      } else {
        // Clear selected size if the color variant has no sizes
        setSelectedSize("");
      }
    }
  }, [selectedColor, product.variants, selectedSize]);

  useEffect(() => {
    // Find matching color variant and then size within it
    const colorVariant = product.variants.find(
      (v) => v.color.value === selectedColor
    );

    if (colorVariant) {
      const sizeVariant = colorVariant.sizes?.find(
        (s) => s.size === selectedSize
      );

      if (sizeVariant) {
        setDisplayedPrice(sizeVariant.price);
        setDisplayedComparePrice(sizeVariant.compareAtPrice);
      } else {
        // Fallback to color-level price
        setDisplayedPrice(colorVariant.price || product.price);
        setDisplayedComparePrice(
          colorVariant.compareAtPrice || product.compareAtPrice
        );
      }

      if (colorVariant.images && colorVariant.images.length > 0) {
        setCurrentImage(colorVariant.images[0]);
      }
    }
  }, [
    selectedColor,
    selectedSize,
    product.variants,
    product.price,
    product.compareAtPrice,
  ]);

  async function addToCart() {
    setLoading(true);
    try {
      // Find the specific variant
      let variantSku,
        variantImage = currentImage;

      // If product has variants, require selection
      if (product.variants.length > 0) {
        const colorVariant = product.variants.find(
          (v) => v.color.value === selectedColor
        );

        if (!colorVariant) {
          alert("Please select a color.");
          setLoading(false);
          return;
        }

        const sizeVariant = colorVariant.sizes?.find(
          (s) => s.size === selectedSize
        );

        // If variant has sizes, require size selection
        if (
          colorVariant.sizes &&
          colorVariant.sizes.length > 0 &&
          !sizeVariant
        ) {
          alert("Please select a size.");
          setLoading(false);
          return;
        }

        variantSku = sizeVariant ? sizeVariant.sku : colorVariant.sku;
        if (colorVariant.images && colorVariant.images.length > 0) {
          variantImage = colorVariant.images[0];
        }
      }

      await addToCartContext({
        product: product._id,
        variantSku,
        quantity,
        unitPrice: displayedPrice,
        image: variantImage,
        color: colors.find((c) => c.value === selectedColor),
        size: selectedSize,
      });

      alert("Added to cart successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding to cart");
    } finally {
      setLoading(false);
    }
  }

  // Check if current variant is in cart
  const activeColorVariant = product.variants.find(
    (v) => v.color.value === selectedColor
  );
  const activeSizeVariant = activeColorVariant?.sizes?.find(
    (s) => s.size === selectedSize
  );

  const isItemInCart = cartItems.some((item) => {
    const itemProductId =
      typeof item.product === "string" ? item.product : item.product._id;
    const sameProduct = itemProductId === product._id;
    const sameVariant =
      product.variants.length > 0
        ? item.variantSku ===
          (activeSizeVariant ? activeSizeVariant.sku : activeColorVariant?.sku)
        : true;
    return sameProduct && sameVariant;
  });

  // Adapter for ProductGallery which expects 'Product' type from types.ts
  // We mock the missing fields for the display component
  // Determine which images to show in gallery
  let galleryImages = product.images;
  let galleryThumbnail = currentImage || product.images[0];

  // If a color is selected, prioritize showing images from variants of that color
  if (selectedColor) {
    const colorVariantMatch = product.variants.find(
      (v) => v.color.value === selectedColor
    );

    if (
      colorVariantMatch &&
      colorVariantMatch.images &&
      colorVariantMatch.images.length > 0
    ) {
      galleryImages = colorVariantMatch.images;
      galleryThumbnail = colorVariantMatch.images[0];
    }
  }

  const galleryProduct = {
    ...product,
    thumbnail: galleryThumbnail,
    images: galleryImages,
  } as const;

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12 xl:gap-16 py-6 md:py-10">
      {/* Product Gallery */}
      <ProductGallery product={galleryProduct} />

      {/* Product Info */}
      <div className="basis-full md:basis-1/2 xl:pr-[200px] py-4 md:py-8">
        <h1 className="text-[28px] md:text-[36px] lg:text-[42px]">
          {product.title}
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-2xl md:text-3xl font-semibold text-black">
            Rs. {(displayedPrice * quantity).toLocaleString()}
          </p>
          {displayedComparePrice && (
            <p className="text-[#BDBDBD] font-normal text-base md:text-lg line-through">
              Rs. {(displayedComparePrice * quantity).toLocaleString()}
            </p>
          )}
        </div>

        {/* Product Rating (Mocked if missing) */}
        <div className="flex items-center gap-6 py-4">
          <RatingStars rating={product.rating || 0} size={20} />
          <span className="border-l border-l-[#9F9F9F] self-stretch md:h-[30px] block"></span>
          <span className="text-sm text-gray-500">
            ({product.reviews?.length || 0} reviews)
          </span>
        </div>

        {/* Product Description */}
        <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl">
          {product.shortDescription ||
            "Experience premium quality and timeless design with our latest selection."}
        </p>

        {/* Product Options */}
        <div className="flex flex-col gap-8 mt-8 border-t border-gray-100 pt-8">
          {/* Color Options */}
          {colors.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm uppercase tracking-widest text-gray-400">
                  Select Color
                </p>
                <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                  {colors.find((c) => c.value === selectedColor)?.label ||
                    "Choose"}
                </span>
              </div>
              <div className="flex gap-4 flex-wrap">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.label}
                    className={`group relative w-9 h-9 rounded-full transition-all duration-300 ease-out p-0.5 ${
                      selectedColor === color.value
                        ? "ring-2 ring-offset-2 ring-black scale-110"
                        : "hover:scale-105"
                    }`}
                  >
                    <span
                      className="absolute inset-0.5 rounded-full border border-black/5 shadow-inner"
                      style={{ backgroundColor: color.value }}
                    />
                    {selectedColor === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className={`w-4 h-4 ${
                            ["#ffffff", "white", "#f", "#fff"].includes(
                              color.value.toLowerCase()
                            )
                              ? "text-black"
                              : "text-white"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Options */}
          {allSizes.length > 0 && availableSizes.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm uppercase tracking-widest text-gray-400">
                  Select Size
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(String(size))}
                    className={`min-w-[44px] h-10 px-4 rounded-lg text-sm font-bold transition-all duration-300 border-2 ${
                      selectedSize === String(size)
                        ? "bg-black text-white border-black shadow-lg -translate-y-0.5"
                        : "bg-white text-gray-500 border-gray-100 hover:border-black hover:text-black hover:shadow-md"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart Container */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 mt-4">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-2 border-gray-100 rounded-xl bg-white p-0.5 min-w-[110px] shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isItemInCart}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-black transition-all disabled:opacity-30"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="w-6 text-center font-bold text-base text-gray-900 tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isItemInCart}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-black transition-all disabled:opacity-30"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={loading || isItemInCart}
              className={`relative flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-black text-base transition-all duration-500 overflow-hidden group shadow-xl ${
                isItemInCart
                  ? "bg-emerald-500 text-white cursor-default"
                  : "bg-black text-white hover:bg-[#1a1a1a] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
              } disabled:opacity-50`}
            >
              {/* Subtle animated background for black state */}
              {!isItemInCart && !loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              )}

              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isItemInCart ? (
                <svg
                  className="w-5 h-5 animate-[bounce_0.5s_ease-in-out]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 transition-transform group-hover:rotate-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              )}

              <span className="relative z-10 uppercase tracking-widest">
                {isItemInCart
                  ? "In Your Cart"
                  : loading
                  ? "Adding..."
                  : "Add to Cart"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
