"use client";
import React, { useState, useRef, MouseEvent, useEffect } from "react";
import Image from "next/image";

// Define a minimal interface for what ProductGallery actually needs
interface ProductGalleryProps {
  thumbnail: string;
  images: string[];
  title: string;
}

function ProductGallery({ product }: { product: ProductGalleryProps }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(product.thumbnail);
  const [isHovering, setIsHovering] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setThumbnail(product.thumbnail);
  }, [product.thumbnail]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setTransform({ x: xPercent, y: yPercent });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 lg:gap-8 basis-full md:basis-1/2">
      {/* Thumbnails Column - Desktop: Left, Mobile: Bottom */}
      <div className="flex md:flex-col gap-3 order-2 md:order-1 no-scrollbar md:max-h-[500px] py-1">
        {product.images.map((imgUrl, index) => (
          <button
            key={index}
            onClick={() => setThumbnail(imgUrl)}
            className={`
              relative min-w-[70px] md:min-w-0 w-[70px] h-[70px] lg:w-[80px] lg:h-[80px] 
              rounded-xl overflow-hidden transition-all duration-300 group
              ${
                thumbnail === imgUrl
                  ? "ring-2 ring-black ring-offset-2 scale-95 shadow-lg"
                  : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 ring-offset-transparent bg-white/50 backdrop-blur-sm border border-black/5"
              }
            `}
          >
            <Image
              src={imgUrl}
              alt={`${product.title} view ${index + 1}`}
              fill
              className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
            />
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div className="relative flex-grow order-1 md:order-2 group">
        <div
          ref={containerRef}
          className="relative aspect-square w-full bg-[#FAFAFA] rounded-2xl overflow-hidden cursor-zoom-in border border-black/5 shadow-sm transition-all duration-500 hover:shadow-xl"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Main Image */}
          <Image
            src={thumbnail}
            alt={product.title}
            fill
            priority
            className={`
              object-contain p-8 transition-all duration-700 ease-out
              ${isHovering ? "opacity-0 scale-110" : "opacity-100 scale-100"}
            `}
          />

          {/* Zoom View - High Resolution Overlay */}
          <div
            className={`
              absolute inset-0 pointer-events-none transition-opacity duration-300 ease-in-out
              ${isHovering ? "opacity-100" : "opacity-0"}
            `}
            style={{
              backgroundImage: `url(${thumbnail})`,
              backgroundPosition: `${transform.x}% ${transform.y}%`,
              backgroundSize: "250%",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Glassmorphism Badge (Optional UI Decoration) */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-white/40 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold uppercase tracking-wider text-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Interactive Zoom
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductGallery;
