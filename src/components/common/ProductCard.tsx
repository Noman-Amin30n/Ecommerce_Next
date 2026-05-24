import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MyButton } from "./Buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { Truck, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductBadgeProps {
  children: React.ReactNode;
  icon?: React.ElementType;
  variant: "shipping" | "discount";
  className?: string;
}

const ProductBadge = ({ children, icon: Icon, variant, className }: ProductBadgeProps) => {
  const variants = {
    shipping: "from-[#88D9E6] to-[#4facfe] shadow-[0_4px_12px_rgba(136,217,230,0.4)]",
    discount: "from-[#FF5714] to-[#ff7e5f] shadow-[0_4px_12px_rgba(255,87,20,0.4)]",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white",
        "bg-gradient-to-r backdrop-blur-md border border-white/20",
        "transition-all duration-300 hover:scale-105 hover:shadow-lg",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon size={12} strokeWidth={3} className="shrink-0" />}
      <span className="drop-shadow-sm">{children}</span>
    </div>
  );
};

interface ProductCard_1Props {
  imageSrc: string;
  imageAlt: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  isFreeShipping?: boolean;
  href?: string;
}
export function ProductCard_Normal({
  imageSrc,
  imageAlt,
  title,
  price,
  compareAtPrice,
  isFreeShipping,
  href = "#",
}: ProductCard_1Props) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col justify-start items-end gap-4 shadow-sm hover:shadow-lg transition-all duration-300 bg-white p-4 cursor-pointer"
      data-aos="fade-up"
    >
      <div className="w-3/4 grow rounded-lg flex justify-center items-center">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={500}
          height={500}
          className={
            "object-contain object-center group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
          }
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {isFreeShipping && (
            <ProductBadge icon={Truck} variant="shipping">
              Free Shipping
            </ProductBadge>
          )}
        </div>
        
        {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
          <div className="absolute top-3 right-3 z-10">
            <ProductBadge icon={Tag} variant="discount">
              {Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)}% OFF
            </ProductBadge>
          </div>
        )}
      </div>
      <div className="self-stretch flex flex-col items-start justify-between">
        <p
          className="leading-normal text-sm md:text-base mb-3 line-clamp-2 h-[40px] md:h-[48px]"
          title={title}
        >
          {title}
        </p>
        <p className="font-medium text-lg md:text-[24px] leading-normal">
          Rs. {price}
        </p>
      </div>
    </Link>
  );
}

export function ProductCard_NormalSkeleton() {
  return (
    <div className="flex flex-col justify-between items-end gap-4">
      {/* Image Skeleton */}
      <div className="w-3/4">
        <Skeleton className="w-full aspect-video" />
      </div>

      {/* Text Skeleton */}
      <div className="self-stretch flex flex-col justify-end items-start">
        <Skeleton className="h-4 w-1/2 mb-3" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export function ProductCardList({
  imageSrc,
  imageAlt,
  title,
  price,
  compareAtPrice,
  isFreeShipping,
  href = "#",
}: ProductCard_1Props) {
  return (
    <Link
      href={href}
      className="flex flex-row items-center gap-6 shadow-sm hover:shadow-md transition-all bg-white cursor-pointer"
    >
      {/* Image */}
      <div className="w-full min-w-[200px] max-w-[250px]">
        <div className="relative overflow-hidden rounded-xl">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={500}
            height={500}
            className="w-full object-contain mix-blend-multiply"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isFreeShipping && (
              <ProductBadge icon={Truck} variant="shipping">
                Free Shipping
              </ProductBadge>
            )}
          </div>
          
          {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
            <div className="absolute top-3 right-3 z-10">
              <ProductBadge icon={Tag} variant="discount">
                {Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)}% OFF
              </ProductBadge>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow justify-between">
        <p className="font-medium text-base md:text-lg line-clamp-2">{title}</p>
        <p className="text-lg md:text-xl font-semibold mt-2">Rs. {price}</p>
      </div>
    </Link>
  );
}

export function ProductCardListSkeleton() {
  return (
    <div className="flex flex-row items-center gap-6 rounded-2xl shadow-sm bg-white p-4">
      {/* Image skeleton */}
      <div className="w-full min-w-[200px] max-w-[250px]">
        <Skeleton className="w-full h-[200px] rounded-xl" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col flex-grow justify-between space-y-3">
        <Skeleton className="h-6 w-3/4" /> {/* title */}
        <Skeleton className="h-6 w-1/3" /> {/* price */}
      </div>
    </div>
  );
}

interface ProductCard_BigProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  href?: string;
}
export function ProductCard_Big({
  imageSrc,
  imageAlt,
  title,
  href = "#",
}: ProductCard_BigProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-start items-end gap-4 md:basis-1/2 lg:pl-[100px] cursor-pointer"
      data-aos="fade-up"
    >
      <div className="w-3/4 relative grow overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={500}
          height={500}
          className={
            "object-contain object-center group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
          }
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      </div>
      <div className="self-stretch">
        <p className="font-medium text-[28px] md:text-[36px] leading-normal mb-5">
          {title}
        </p>
        <MyButton btnText="View More" />
      </div>
    </Link>
  );
}
