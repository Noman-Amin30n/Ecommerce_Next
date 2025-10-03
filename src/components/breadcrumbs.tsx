"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { TfiAngleRight } from "react-icons/tfi";
import Link from "next/link";

function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  // console.log(pathSegments);
  let currentPath = "";
  return (
    <Breadcrumb className="mt-5">
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          currentPath += currentPath === "/" ? segment : `/${segment}`;
          console.log(currentPath);
          return (
            <BreadcrumbItem key={index}>
              {index === pathSegments.length - 1 ? (
                <BreadcrumbPage className="text-sm sm:text-base text-black font-light">{segment.charAt(0).toUpperCase() + segment.slice(1)}</BreadcrumbPage>
              ) : (
                <>
                  <Link href={currentPath} className="text-sm sm:text-base text-black font-medium hover:underline">
                    {segment.charAt(0).toUpperCase() + segment.slice(1) || "Home"}
                  </Link>
                  <TfiAngleRight color="#000" className="ml-[6px] mr-[2px] text-sm sm:text-base" strokeWidth={1} />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
