"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { X, Search, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchSuggestion {
  _id: string;
  title: string;
  slug: string;
  price: number;
  thumbnail: string;
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounced search function
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/products?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.products || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/shop?searchQuery=${encodeURIComponent(searchQuery.trim())}`
      );
      setOpen(false);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/shop/${slug}`);
    setOpen(false);
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(
        `/shop?searchQuery=${encodeURIComponent(searchQuery.trim())}`
      );
      setOpen(false);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  return (
    <>
      {/* Manual Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in-0 duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogTrigger asChild>
          <button className="focus:outline-none hover:scale-110 transition-transform duration-200 relative group">
            <CiSearch stroke="#000" size={24} strokeWidth={1} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FF5714] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 animate-pulse" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] p-0 gap-0 bg-white border-none shadow-2xl overflow-hidden flex flex-col">
          {/* Refined Header with Smooth Gradient */}
          <div className="relative bg-[#88D9E6] p-4 sm:p-6 flex-shrink-0">
            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#88D9E6]/90 via-[#88D9E6] to-[#7BC9D6] opacity-90" />
            <DialogHeader className="relative">
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
                  <Search className="text-slate-800" size={28} />
                </div>
                <span className="flex items-center gap-2">
                  Discover Products
                  <Sparkles
                    className="text-[#FF5714] animate-pulse"
                    size={20}
                  />
                </span>
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 bg-white overflow-y-auto flex-1">
            {/* Enhanced Search Input */}
            <form onSubmit={handleSearch} className="relative mb-6">
              <div className="relative group">
                {/* Subtle glow effect on focus */}
                <div className="absolute inset-0 bg-[#88D9E6]/20 rounded-xl opacity-0 group-focus-within:opacity-100 blur-md transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <Search
                    className="absolute left-4 text-gray-400 group-focus-within:text-[#88D9E6] transition-colors duration-200"
                    size={22}
                  />
                  <Input
                    type="text"
                    placeholder="Search for furniture, decor, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-12 py-7 text-base border-2 border-gray-200 focus:border-[#88D9E6] focus:ring-4 focus:ring-[#88D9E6]/20 rounded-xl transition-all duration-200 bg-white shadow-sm font-medium placeholder:text-gray-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="absolute right-4 p-1.5 text-gray-400 hover:text-white hover:bg-[#FF5714] rounded-full transition-all duration-200"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1">
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">
                  Enter
                </kbd>
                to search or click a suggestion
              </p>
            </form>

            {/* Search Results */}
            <div className="min-h-[200px] max-h-[300px] sm:max-h-[450px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              {isLoading ? (
                // Enhanced Loading State
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 animate-pulse"
                    >
                      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                        <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() && suggestions.length > 0 ? (
                // Enhanced Suggestions List
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <TrendingUp className="text-[#FF5714]" size={18} />
                    <p className="text-sm font-semibold text-gray-700">
                      Top Results
                    </p>
                  </div>
                  {suggestions.map((product, index) => (
                    <button
                      key={product._id}
                      onClick={() => handleSuggestionClick(product.slug)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-[#88D9E6]/5 transition-all duration-200 group border-2 border-transparent hover:border-[#88D9E6]/30 hover:shadow-md"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search size={28} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-gray-800 group-hover:text-[#FF5714] transition-colors line-clamp-2 mb-1">
                          {product.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-lg text-[#FF5714] font-bold">
                            Rs. {product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight
                        className="text-gray-400 group-hover:text-[#88D9E6] group-hover:translate-x-1 transition-all duration-200"
                        size={22}
                      />
                    </button>
                  ))}

                  {/* Refined View All Results Button */}
                  <button
                    onClick={handleViewAllResults}
                    className="w-full mt-6 py-4 px-6 bg-[#88D9E6] hover:bg-[#7BC9D6] text-slate-800 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <span>View All Results for &quot;{searchQuery}&quot;</span>
                    <ArrowRight
                      className="group-hover:translate-x-1 transition-transform"
                      size={20}
                    />
                  </button>
                </div>
              ) : searchQuery.trim() && !isLoading ? (
                // Enhanced No Results
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Search className="text-gray-400" size={44} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    No products found
                  </h3>
                  <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                    We couldn&apos;t find any products matching{" "}
                    <span className="font-semibold text-[#FF5714]">
                      &quot;{searchQuery}&quot;
                    </span>
                    .
                    <br />
                    Try different keywords or browse our shop.
                  </p>
                </div>
              ) : (
                // Enhanced Empty State
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-[#88D9E6] rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Search className="text-white" size={44} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Start your search
                  </h3>
                  <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                    Discover amazing furniture and decor by searching for
                    products by name, category, or description
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {["Sofa", "Chair", "Table", "Lamp"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchQuery(term)}
                        className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-[#88D9E6] hover:bg-[#88D9E6]/5 rounded-full text-sm font-medium text-gray-700 hover:text-[#88D9E6] transition-all duration-200 hover:shadow-md"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
