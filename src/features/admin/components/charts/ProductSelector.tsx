"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";
import { ProductSearchResult } from "@/types/analytics.types";

interface ProductSelectorProps {
  selectedProduct: ProductSearchResult | null;
  onSelectProduct: (product: ProductSearchResult) => void;
}

export default function ProductSelector({
  selectedProduct,
  onSelectProduct,
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch products
  const fetchProducts = useCallback(
    async (search: string, currentOffset: number, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          offset: currentOffset.toString(),
          limit: currentOffset === 0 ? "5" : "10", // Initial load: 5, pagination: 10
        });

        const res = await fetch(
          `/api/admin/analytics/products/search?${params}`,
        );
        if (res.ok) {
          const data = await res.json();
          setProducts((prev) =>
            append ? [...prev, ...data.products] : data.products,
          );
          setHasMore(data.hasMore);

          // Auto-select first product on initial load if none selected
          if (
            currentOffset === 0 &&
            data.products.length > 0 &&
            !selectedProduct
          ) {
            onSelectProduct(data.products[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedProduct, onSelectProduct],
  );

  // Initial load
  useEffect(() => {
    fetchProducts("", 0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setOffset(0);
      fetchProducts(searchTerm, 0, false);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Handle scroll for pagination
  const handleScroll = useCallback(() => {
    if (!listRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      const newOffset = offset + 10;
      setOffset(newOffset);
      fetchProducts(searchTerm, newOffset, true);
    }
  }, [loading, hasMore, offset, searchTerm, fetchProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Product Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-colors"
      >
        {selectedProduct ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {selectedProduct.images[0] && (
              <Image
                src={selectedProduct.images[0]}
                alt={selectedProduct.title}
                width={40}
                height={40}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {selectedProduct.title}
              </p>
              <p className="text-xs text-gray-500">
                PKR {selectedProduct.price.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Select a product...</span>
        )}
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300"
              />
            </div>
          </div>

          {/* Product List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-80 overflow-y-auto"
          >
            {products.length === 0 && !loading ? (
              <div className="p-6 text-center text-sm text-gray-500">
                No products found
              </div>
            ) : (
              products.map((product) => (
                <button
                  key={product._id}
                  onClick={() => {
                    onSelectProduct(product);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${
                    selectedProduct?._id === product._id
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  {product.images[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      PKR {product.price.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))
            )}
            {loading && (
              <div className="p-4 text-center">
                <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
