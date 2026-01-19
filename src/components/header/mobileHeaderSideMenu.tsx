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
import { CiHeart } from "react-icons/ci";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Link from "next/link";
import { Lock, LogIn, LogOut, UserPen, UserPlus, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { signOut, useSession } from "next-auth/react";
import SearchDialog from "./searchDialog";

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

  const navLinks = [
    { href: "/", label: "Home", icon: <GoHome size={20} /> },
    { href: "/shop", label: "Shop", icon: <BsShop size={20} /> },
    {
      href: "/about",
      label: "About",
      icon: <IoIosInformationCircleOutline size={20} />,
    },
    {
      href: "/contact",
      label: "Contact",
      icon: <MdOutlineContactMail size={20} />,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
          <MdMenu className="text-[28px] text-gray-800" />
        </button>
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="w-[300px] z-[998] sm:w-[350px] bg-white border-none p-0 flex flex-col h-full shadow-2xl"
      >
        {/* Header Section */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#FF5714]"
          >
            Store.
          </Link>
          <SheetClose asChild>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
              <X className="text-gray-500" size={24} />
            </button>
          </SheetClose>
        </div>

        {/* User Profile Section (if authenticated) */}
        {sessionStatus === "authenticated" && (
          <div className="px-6 py-6 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                <AvatarImage src={avatar} alt={session.user.name || ""} />
                <AvatarFallback
                  style={{ backgroundColor: avatarBgColor || "#FF5714" }}
                  className="text-white font-bold"
                >
                  {getUserInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {session.user.name}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                  {session.user.email}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:text-[#FF5714] hover:bg-orange-50 rounded-xl transition-all duration-200 group"
              >
                <span className="text-gray-400 group-hover:text-[#FF5714] transition-colors">
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}

            {sessionStatus === "authenticated" && (
              <Link
                href="/account"
                className="flex items-center gap-4 px-4 py-3 text-gray-700 hover:text-[#FF5714] hover:bg-orange-50 rounded-xl transition-all duration-200 group"
              >
                <UserPen
                  className="text-gray-400 group-hover:text-[#FF5714]"
                  size={20}
                />
                <span className="font-medium">My Account</span>
              </Link>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="mt-8 px-4 space-y-3">
            {sessionStatus === "authenticated" ? (
              <>
                {session.user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex justify-center items-center gap-2 w-full py-3.5 px-6 bg-gray-900 text-white rounded-xl font-semibold shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-95"
                  >
                    <Lock size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="flex justify-center items-center gap-2 w-full py-3.5 px-6 border-2 border-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-95"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/account"
                  className="flex justify-center items-center gap-2 py-3.5 px-4 bg-[#FF5714] text-white rounded-xl font-semibold shadow-lg shadow-orange-100 hover:bg-[#e64a0e] transition-all active:scale-95 text-sm"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/account"
                  className="flex justify-center items-center gap-2 py-3.5 px-4 border-2 border-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-95 text-sm"
                >
                  <UserPlus size={18} />
                  <span>Join</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="p-2 group-hover:bg-white rounded-lg transition-all group-hover:shadow-sm">
              <SearchDialog />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              Search
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="p-2 group-hover:bg-white rounded-lg transition-all group-hover:shadow-sm">
              <CiHeart
                size={24}
                className="group-hover:text-red-500 transition-colors"
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              Wishlist
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 group cursor-pointer">
            <div className="p-2 group-hover:bg-white rounded-lg transition-all group-hover:shadow-sm">
              <AiOutlineShoppingCart
                size={24}
                className="group-hover:text-[#FF5714] transition-colors"
              />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Cart</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileHeaderSideMenu;
