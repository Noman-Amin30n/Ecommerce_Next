import React from "react";
import Image from "next/image";
import { MyButton } from "./buttons";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCard_1Props {
  imageSrc: string;
  imageAlt: string;
  title: string;
  price: string;
}
export async function ProductCard_Normal({
  imageSrc,
  imageAlt,
  title,
  price,
}: ProductCard_1Props) {
  return (
    <div className="flex flex-col justify-between items-end gap-4 rounded-2xl shadow-sm hover:shadow-md transition-all bg-white p-4">
      <div className="w-3/4">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={500}
          height={500}
          className={"object-contain object-center"}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      </div>
      <div className="self-stretch flex flex-col justify-end items-start">
        <p className="leading-normal text-sm md:text-base mb-3">{title}</p>
        <p className="font-medium text-lg md:text-[24px] leading-normal">
          Rs. {price}
        </p>
      </div>
    </div>
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
}: ProductCard_1Props) {
  return (
    <div className="flex flex-row items-center gap-6 rounded-2xl shadow-sm hover:shadow-md transition-all bg-white">
      {/* Image */}
      <div className="w-full min-w-[200px] max-w-[250px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={500}
          height={500}
          className="w-full object-contain rounded-xl"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow justify-between">
        <p className="font-medium text-base md:text-lg line-clamp-2">{title}</p>
        <p className="text-lg md:text-xl font-semibold mt-2">Rs. {price}</p>
      </div>
    </div>
  );
}

interface ProductCard_BigProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
}
export function ProductCard_Big({
  imageSrc,
  imageAlt,
  title,
}: ProductCard_BigProps) {
  return (
    <div className="flex flex-col justify-start items-end gap-4 md:basis-1/2 lg:pl-[100px]">
      <div className="w-3/4 relative grow">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={500}
          height={500}
          className={"object-contain object-center"}
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
    </div>
  );
}
