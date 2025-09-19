import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MdMenu } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { GoHome } from "react-icons/go";
import { BsShop } from "react-icons/bs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdOutlineContactMail } from "react-icons/md";
import { TbUserExclamation } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { AiOutlineShoppingCart } from "react-icons/ai";

function MobileHeaderSideMenu() {
  return (
    <Sheet>
      <SheetTrigger>
        <MdMenu stroke="#000" className="text-[28px]" />
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="w-full bg-[#301934] border-none py-0 px-0 isolate z-[999]"
      >
        <div className="flex justify-end items-center min-h-[80px] px-6">
          <SheetClose>
            <IoClose stroke="#000" className="text-[28px] text-[#fbebb5]" />
          </SheetClose>
        </div>
        <div className="flex flex-col justify-between items-stretch h-[calc(100dvh-80px)]">
          <ul className="space-y-6 text-base text-[#fbebb5] font-medium px-6">
            <li className="flex justify-start items-center gap-2 leading-none">
              <GoHome stroke="#000" size={20} />
              <span>Home</span>
            </li>
            <li className="flex justify-start items-center gap-2 leading-none">
              <BsShop stroke="#000" size={20} />
              <span>Shop</span>
            </li>
            <li className="flex justify-start items-center gap-2 leading-none">
              <IoIosInformationCircleOutline stroke="#000" size={20} />
              <span>About</span>
            </li>
            <li className="flex justify-start items-center gap-2 leading-none">
              <MdOutlineContactMail stroke="#000" size={20} />
              <span>Contact</span>
            </li>
          </ul>
          <div className="grid grid-cols-4 gap-4 bg-white text-[#301934] px-6 py-5">
            <div className="flex justify-center items-center">
              <TbUserExclamation size={28} />
            </div>
            <div className="flex justify-center items-center">
              <CiSearch size={28} strokeWidth={1} />
            </div>
            <div className="flex justify-center items-center">
              <CiHeart size={28} strokeWidth={1} />
            </div>
            <div className="flex justify-center items-center">
              <AiOutlineShoppingCart size={28} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileHeaderSideMenu;
