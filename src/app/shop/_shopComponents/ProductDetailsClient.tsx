"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";
import ProductGallery from "@/components/productGallery";
import RatingStars from "@/components/rating";
import { Loader2, Minus, Plus, ShoppingCart, Check } from "lucide-react";

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

interface CartItem {
  product: string | { _id: string };
  variantSku?: string;
  color?: { label: string; value: string };
  size?: string;
  quantity: number;
}

interface ProductDetailsClientProps {
  product: ClientProduct;
}

// Helper function to get or create guest session ID
function getOrCreateGuestSessionId(): string {
  const COOKIE_NAME = "guestSessionId";
  let sessionId = Cookies.get(COOKIE_NAME);

  if (!sessionId) {
    // Generate unique session ID: guest_timestamp_randomString
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    sessionId = `guest_${timestamp}_${randomString}`;

    // Store in cookie with 30-day expiration
    Cookies.set(COOKIE_NAME, sessionId, { expires: 30 });
  }

  return sessionId;
}

export default function ProductDetailsClient({
  product,
}: ProductDetailsClientProps) {
  const router = useRouter();
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const sessionId = Cookies.get("guestSessionId");
      const url = sessionId ? `/api/cart?sessionId=${sessionId}` : "/api/cart";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.cart?.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [session]);

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

      // Prepare request body
      const requestBody: {
        items: Array<{
          product: string;
          variantSku?: string;
          quantity: number;
          unitPrice: number;
          image?: string;
          color?: { label: string; value: string };
          size?: string;
        }>;
        sessionId?: string;
      } = {
        items: [
          {
            product: product._id,
            variantSku,
            quantity,
            unitPrice: displayedPrice,
            image: variantImage,
            color: colors.find((c) => c.value === selectedColor),
            size: selectedSize,
          },
        ],
      };

      // For guest users, add session ID
      if (!session?.user) {
        requestBody.sessionId = getOrCreateGuestSessionId();
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add to cart");
      }

      const data = await res.json();
      console.log("Cart updated:", data);
      alert("Added to cart successfully!");
      fetchCart(); // Refresh cart items
      router.refresh(); // Refresh to update cart in header if possible
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
    <div className="w-full flex flex-col md:flex-row md:gap-10 xl:gap-20">
      {/* Product Gallery */}
      <ProductGallery product={galleryProduct} />

      {/* Product Info */}
      <div className="basis-full md:basis-1/2 lg:max-w-[500px] py-4 md:py-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-2">
          {product.title}
        </h1>

        <div className="flex items-center gap-4 mb-4">
          <p className="text-2xl md:text-3xl font-bold text-black">
            Rs. {(displayedPrice * quantity).toLocaleString()}
          </p>
          {displayedComparePrice && (
            <p className="text-lg md:text-xl text-gray-400 line-through">
              Rs. {(displayedComparePrice * quantity).toLocaleString()}
            </p>
          )}
        </div>

        {/* Product Rating */}
        <div className="flex items-center gap-4 py-2 mb-2 border-y border-gray-100">
          <RatingStars rating={product.rating || 0} size={18} />
          <span className="h-4 w-[1px] bg-gray-300"></span>
          <span className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
            {product.reviews?.length || 0} Customer Reviews
          </span>
        </div>

        {/* Product Description */}
        <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-8">
          {product.shortDescription || "No description available."}
        </p>

        {/* Product Options */}
        <div className="space-y-8">
          {/* Color Options */}
          {colors.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Color
                </p>
                <span className="text-sm text-gray-500 italic">
                  {colors.find((c) => c.value === selectedColor)?.label ||
                    "Select a color"}
                </span>
              </div>
              <div className="flex gap-4 flex-wrap">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.label}
                    className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      selectedColor === color.value
                        ? "ring-2 ring-offset-2 ring-black"
                        : "ring-1 ring-gray-200 hover:ring-gray-400"
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full border border-gray-100 shadow-inner"
                      style={{ backgroundColor: color.value }}
                    />
                    {selectedColor === color.value && (
                      <Check
                        className={`absolute w-4 h-4 ${
                          // Simple luminosity check for white/light colors
                          ["#ffffff", "white", "#f", "#F"].some((c) =>
                            color.value.toLowerCase().includes(c)
                          )
                            ? "text-black"
                            : "text-white"
                        }`}
                      />
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
                <p className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  Size
                </p>
                <button className="text-sm text-gray-500 underline hover:text-black transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(String(size))}
                    className={`min-w-[56px] h-12 flex items-center justify-center px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      selectedSize === String(size)
                        ? "bg-black text-white border-black shadow-lg transform scale-105"
                        : "bg-white text-gray-900 border-gray-200 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            {/* Quantity */}
            <div className="flex items-center justify-between border-2 border-gray-200 rounded-xl px-2 h-14 min-w-[140px]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isItemInCart}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
              >
                <Minus size={18} />
              </button>
              <span className="text-lg font-bold w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isItemInCart}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Add to Cart */}
            <button
              onClick={addToCart}
              disabled={loading || isItemInCart}
              className={`flex-1 flex items-center justify-center gap-3 h-14 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-95 ${
                isItemInCart
                  ? "bg-green-500 text-white cursor-default"
                  : loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 hover:shadow-xl"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : isItemInCart ? (
                <>
                  <Check size={24} />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>Add To Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
