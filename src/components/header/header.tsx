import React from "react";
import { TbUserExclamation } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { cn } from "@/lib/utils";
import MobileHeaderSideMenu from "./mobileHeaderSideMenu";
import SideCart from "./sideCart";
import Link from "next/link";

function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "min-h-14 md:min-h-[100px] px-6 flex items-center",
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto flex justify-end md:justify-between items-center grow">
        <div className="hidden md:block"></div>
        <div className="hidden md:flex justify-between items-center font-medium gap-[75px]">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <p>About</p>
          <p>Contact</p>
        </div>
        <div className="hidden md:flex justify-between items-center gap-7">
          <TbUserExclamation stroke="#000" size={24} />
          <CiSearch stroke="#000" size={24} strokeWidth={1} />
          <CiHeart stroke="#000" size={24} strokeWidth={1} />
          <SideCart />
        </div>
        <div className="md:hidden flex item-center">
          <MobileHeaderSideMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
