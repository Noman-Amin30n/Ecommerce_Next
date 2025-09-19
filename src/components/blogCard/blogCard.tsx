import React from "react";
import Image from "next/image";
import { MyButton } from "../buttons";
import { FiClock } from "react-icons/fi";
import { MdOutlineDateRange } from "react-icons/md";
import BlogCardTimestamps from "./blogCardTimestamps";

interface BlogCardProps {
    imageSrc: string;
    imageAlt: string;
    title: string;
    readTime: string;
    createdAt: Date;
}
function BlogCard({
    imageSrc,
    imageAlt,
    title,
    readTime,
    createdAt
}: BlogCardProps) {
  return (
    <div className="flex flex-col justify-start items-stretch gap-8">
      <div className="relative aspect-square rounded-[10px] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill={true}
          className="object-cover object-center"
        />
      </div>
      <div className="px-6 sm:px-0 flex flex-col justify-start items-center">
        <p className="text-base sm:text-lg lg:text-xl leading-normal text-center mb-2">
            {title}
        </p>
        <MyButton btnText="Read More" />
        <div className="mt-4 flex justify-center items-center gap-4 text-sm md:text-base leading-none font-light">
          <span className="flex justify-start items-center gap-2">
            <FiClock className="text-base md:text-lg" />
            <span>{readTime}</span>
          </span>
          <span className="flex justify-start items-center gap-2">
            <MdOutlineDateRange className="text-base md:text-lg" />
            <BlogCardTimestamps createdAt={createdAt} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;
