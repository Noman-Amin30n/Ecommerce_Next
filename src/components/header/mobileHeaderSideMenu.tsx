"use client";
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MdMenu } from "react-icons/md";
import { GoHome } from "react-icons/go";
import { BsShop } from "react-icons/bs";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdOutlineContactMail } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Link from "next/link";
import { Lock, LogIn, LogOut, UserPen, UserPlus, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { signOut, useSession } from "next-auth/react";

interface IMobileHeaderSideMenu {
  avatar?: string;
  avatarBgColor?: string;
  getUserInitials: (name: string | null | undefined) => string;
}

function MobileHeaderSideMenu({
  avatar,
  avatarBgColor,
  getUserInitials,
}: IMobileHeaderSideMenu) {
  const { data: session, status: sessionStatus } = useSession();
  return (
    <Sheet>
      <SheetTrigger>
        <MdMenu stroke="#000" className="text-[28px]" />
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="w-full bg-[#88D9E6] border-none py-0 px-0 isolate z-[999]"
      >
        <div className="flex justify-end items-center min-h-[80px] px-6">
          <SheetClose>
            <X
              stroke="#000"
              className="text-[#050505]"
              size={32}
              strokeWidth={1.5}
            />
          </SheetClose>
        </div>
        <div className="flex flex-col justify-between items-stretch h-[calc(100dvh-80px)]">
          <ul className="space-y-6 text-sm text-[#050505] px-6">
            <Link
              href="/"
              className="flex justify-start items-center gap-2 leading-none"
            >
              <GoHome stroke="#000" size={16} />
              <span>Home</span>
            </Link>
            <Link
              href="/shop"
              className="flex justify-start items-center gap-2 leading-none"
            >
              <BsShop stroke="#000" size={16} />
              <span>Shop</span>
            </Link>
            <li className="flex justify-start items-center gap-2 leading-none">
              <IoIosInformationCircleOutline stroke="#000" size={16} />
              <span>About</span>
            </li>
            <li className="flex justify-start items-center gap-2 leading-none">
              <MdOutlineContactMail stroke="#000" size={16} />
              <span>Contact</span>
            </li>
            {sessionStatus === "authenticated" && (
              <Link
                href="/account"
                className="flex justify-start items-center gap-2 leading-none"
              >
                <UserPen stroke="#000" size={16} />
                <span>My Account</span>
              </Link>
            )}
            <li className="flex justify-between items-stretch flex-wrap gap-4 text-sm text-nowrap">
              {sessionStatus === "authenticated" ? (
                <>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="basis-[100px] grow flex justify-center items-center gap-2 py-3 px-5 rounded-full bg-[#FF5714] text-white shadow-md"
                    >
                      <span>
                        <Lock size={16} />
                      </span>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    className={`${
                      session.user.role === "admin"
                        ? "basis-[100px] border border-[#050505] text-[#050505]"
                        : "basis-full bg-[#050505] text-white"
                    } grow flex justify-center items-center gap-2 px-5 py-3 rounded-full shadow-md`}
                    onClick={() => signOut()}
                  >
                    <span>
                      <LogOut size={16} />
                    </span>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/account"
                    className="basis-[100px] grow flex justify-center items-center gap-2 py-3 px-5 rounded-full bg-[#FF5714] text-white shadow-md"
                  >
                    <LogIn size={16} />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/account"
                    className="basis-[100px] grow flex justify-center items-center gap-2 py-3 px-5 rounded-full border border-[#050505] text-[#050505] shadow-md"
                  >
                    <UserPlus size={16} />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </li>
          </ul>
          <div
            className={`grid ${
              sessionStatus === "authenticated" ? "grid-cols-4" : "grid-cols-3"
            } gap-4 bg-white text-[#FF5714] px-6 py-5`}
          >
            {sessionStatus === "authenticated" && (
              <div className="flex justify-center items-center">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={avatar} alt={session.user.name || ""} />
                  <AvatarFallback
                    style={{ backgroundColor: avatarBgColor }}
                    className="text-white font-semibold"
                  >
                    {getUserInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
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
