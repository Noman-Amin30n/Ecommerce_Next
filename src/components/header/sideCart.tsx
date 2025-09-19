import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { TbShoppingCartX } from "react-icons/tb";
import { IoMdCloseCircle } from "react-icons/io";
import Image from "next/image";

function SideCart() {
  return (
    <Sheet>
      <SheetTrigger>
        <AiOutlineShoppingCart stroke="#000" size={24} />
      </SheetTrigger>
      <SheetContent className="isolate z-[1000] p-0 flex flex-col justify-start gap-0 w-[417px] lg:max-w-[417px]">
        <section className="p-7 flex flex-col justify-start items-stretch grow">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-[24px] font-semibold leading-none">
              Shopping Cart
            </h2>
            <SheetClose>
              <TbShoppingCartX stroke="#9F9F9F" size={20} />
            </SheetClose>
          </div>
          <hr className="h-0 border-0 border-b border-[#D9D9D9] mt-7 w-4/5" />
          <div className="flex flex-col justify-start mt-8 gap-5 grow">
            {/* Cart item */}
            <div className="flex justify-between items-center gap-5 pl-1">
              <div className="w-[105px] h-[105px] bg-[#FBEBB5] rounded-xl flex justify-center items-center">
                <Image
                  src={"/images/products/product_7.png"}
                  alt="Cart item"
                  width={105}
                  height={105}
                  className="w-[94px] object-center"
                />
              </div>
              <div className="grow pr-7">
                <p className="leading-none">Asgaard Sofa</p>
                <div className="flex justify-between items-center mt-4">
                    <span className="font-light">1</span>
                    <span className="font-light">X</span>
                    <span className="font-medium text-xs leading-none text-[#B88E2F]">Rs. 250,000.00</span>
                </div>
              </div>
                <IoMdCloseCircle className="text-[#9F9F9F]" size={22} />
            </div>
          </div>
          <div className="flex justify-between items-center mt-7 pr-14">
            <span>Subtotal</span>
            <span className="font-semibold text-[#B88E2F]">Rs. 250,000.00</span>
          </div>
        </section>
        <hr className="border-0 border-t border-[#D9D9D9]" />
        <section className="p-7 flex justify-start gap-8">
            <button className="border border-black rounded-[50px] px-8 py-2 text-[#000] text-xs">View Cart</button>
            <button className="border border-black rounded-[50px] px-8 py-2 text-[#000] text-xs">Checkout</button>
        </section>
      </SheetContent>
    </Sheet>
  );
}

export default SideCart;
