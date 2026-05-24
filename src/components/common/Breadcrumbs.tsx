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

function Breadcrumbs({ forPage, productTitle }: { forPage?: string; productTitle?: string }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  let currentPath = "";

  let content;

  switch (forPage) {
    case "singleProduct":
      content = (
        <Breadcrumb>
          <BreadcrumbList className="gap-3 sm:gap-7">
            {pathSegments.map((segment, index) => {
              currentPath += currentPath === "/" ? segment : `/${segment}`;
              return (
                <BreadcrumbItem key={index} className="gap-4">
                  {index === pathSegments.length - 1 ? (
                    <BreadcrumbPage className="text-sm sm:text-base text-black border-l-2 border-[#9F9F9F] pl-3 md:pl-7 md:h-[37px] flex items-center">
                      {productTitle}
                    </BreadcrumbPage>
                  ) : (
                    <>
                      <Link
                        href={currentPath}
                        className="text-sm sm:text-base text-[#9F9F9F] hover:underline"
                      >
                        {segment.charAt(0).toUpperCase() + segment.slice(1) || "Home"}
                      </Link>
                      <TfiAngleRight
                        color="#000"
                        className="text-sm"
                        strokeWidth={1.6}
                      />
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      );
      break;

    default:
      content = (
        <Breadcrumb className="mt-5">
          <BreadcrumbList>
            {pathSegments.map((segment, index) => {
              currentPath += currentPath === "/" ? segment : `/${segment}`;
              return (
                <BreadcrumbItem key={index}>
                  {index === pathSegments.length - 1 ? (
                    <BreadcrumbPage className="text-sm sm:text-base text-black font-light">
                      {segment.charAt(0).toUpperCase() + segment.slice(1)}
                    </BreadcrumbPage>
                  ) : (
                    <>
                      <Link
                        href={currentPath}
                        className="text-sm sm:text-base text-black font-medium hover:underline"
                      >
                        {segment.charAt(0).toUpperCase() + segment.slice(1) || "Home"}
                      </Link>
                      <TfiAngleRight
                        color="#000"
                        className="ml-[6px] mr-[2px] text-sm sm:text-base"
                        strokeWidth={1}
                      />
                    </>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      );
  }

  return content;
}

export default Breadcrumbs;
