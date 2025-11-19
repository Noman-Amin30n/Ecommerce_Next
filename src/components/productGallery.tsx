"use client";
import React, { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { Product } from "@/typescript/types";

function ProductGallery({ product }: { product: Product }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [thumbnail, setThumbnail] = useState<string>(product.thumbnail);
  const [isHovering, setIsHovering] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Cursor position relative to container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setTransform({ x: xPercent, y: yPercent });
  };

  return (
    <div className="flex flex-col sm:flex-row py-4 md:py-8 gap-3 lg:gap-8 basis-full md:basis-1/2">
      {/* Feature Image */}
      <div
        className="grow min-h-[350px] md:min-h-[500px] bg-[#FFF9E5] rounded-[10px] flex justify-center items-center overflow-hidden cursor-zoom-out"
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={thumbnail}
          alt={product.title}
          width={500}
          height={500}
          className="object-contain object-center"
          style={{
            transform: isHovering
              ? `scale(2) translate(
                ${-(transform.x - 50) / 2}%, 
                ${-(transform.y - 50) / 2}%
              )`
              : "scale(1) translate(0, 0)",
            transformOrigin: "center center",
          }}
        />
      </div>

      {/* Other Product Images */}
      <div className="sm:order-[-1] flex sm:flex-col gap-3 lg:gap-8">
        <div className="w-[76px] h-[80px] bg-[#fff9e5] hover:bg-[rgba(0,0,0,0.1)] rounded-[8px] transition-all duration-200 relative flex justify-center items-center cursor-pointer">
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={76}
            height={80}
            className="object-contain object-center"
            onClick={() => setThumbnail(product.thumbnail)}
          />
        </div>
        {product.images.map((imgUrl, index) => (
          <div
            key={index}
            className="w-[76px] h-[80px] bg-[#fff9e5] hover:bg-[rgba(0,0,0,0.1)] rounded-[8px] transition-all duration-200 relative flex justify-center items-center cursor-pointer"
          >
            <Image
              src={imgUrl}
              alt={`${product.title} image ${index + 1}`}
              width={76}
              height={80}
              className="object-contain object-center"
              onClick={() => setThumbnail(imgUrl)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductGallery;
