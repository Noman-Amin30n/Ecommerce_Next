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
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

function SideCart() {
  const { cartItems, cartCount, subtotal, removeFromCart } = useCart();

  return (
    <Sheet>
      <SheetTrigger className="relative flex items-center">
        <AiOutlineShoppingCart stroke="#000" size={24} />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#B88E2F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="z-[1000] p-0 flex flex-col justify-start gap-0 w-[417px] lg:max-w-[417px] overflow-hidden">
        <section className="p-7 flex flex-col justify-start items-stretch grow overflow-y-auto">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-[24px] font-semibold leading-none">
              Shopping Cart
            </h2>
            <SheetClose>
              <TbShoppingCartX stroke="#9F9F9F" size={20} />
            </SheetClose>
          </div>
          <hr className="h-0 border-0 border-b border-[#D9D9D9] mt-7 w-4/5" />

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center grow gap-4 py-20">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <AiOutlineShoppingCart className="text-gray-300" size={40} />
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-gray-900">
                  No Items in the cart
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {"Looks like you haven't added anything yet."}
                </p>
              </div>
              <SheetClose asChild>
                <Link
                  href="/shop"
                  className="mt-4 px-8 py-2 border border-black rounded-full hover:bg-black hover:text-white transition-colors text-sm font-medium"
                >
                  Start Shopping
                </Link>
              </SheetClose>
            </div>
          ) : (
            <>
              <div className="flex flex-col justify-start mt-8 gap-5 grow">
                {cartItems.map((item, index) => {
                  const productTitle =
                    typeof item.product === "object"
                      ? item.product.title
                      : "Product";
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center gap-5 pl-1"
                    >
                      <div className="w-[105px] h-[105px] bg-[#FBEBB5] rounded-xl flex justify-center items-center overflow-hidden">
                        <Image
                          src={item.image || "/images/placeholder.png"}
                          alt={productTitle}
                          width={105}
                          height={105}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="grow pr-7">
                        <p className="leading-none font-medium truncate max-w-[150px]">
                          {productTitle}
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                          <span className="font-light">{item.quantity}</span>
                          <span className="font-light text-xs">X</span>
                          <span className="font-medium text-xs leading-none text-[#B88E2F]">
                            Rs. {item.unitPrice.toLocaleString()}
                          </span>
                        </div>
                        {(item.color || item.size) && (
                          <div className="flex gap-2 mt-2">
                            {item.color && (
                              <div
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: item.color.value }}
                                title={item.color.label}
                              />
                            )}
                            {item.size && (
                              <span className="text-[10px] text-gray-500 uppercase">
                                {item.size}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <IoMdCloseCircle className="text-[#9F9F9F]" size={22} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center mt-auto pt-7 pr-14 border-t border-[#D9D9D9]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#B88E2F]">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </section>

        {cartItems.length > 0 && (
          <>
            <hr className="border-0 border-t border-[#D9D9D9]" />
            <section className="p-7 flex justify-start gap-8">
              <Link href="/cart">
                <button className="border border-black rounded-[50px] px-8 py-2 text-[#000] text-xs hover:bg-black hover:text-white transition-all">
                  View Cart
                </button>
              </Link>
              <Link href="/checkout">
                <button className="border border-black rounded-[50px] px-8 py-2 text-[#000] text-xs hover:bg-black hover:text-white transition-all">
                  Checkout
                </button>
              </Link>
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default SideCart;
