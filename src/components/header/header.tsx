"use client";
import React, { useState, useEffect } from "react";
import { CiHeart } from "react-icons/ci";
import { LockKeyhole, LogIn, User, UserPen, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileHeaderSideMenu from "./mobileHeaderSideMenu";
import SideCart from "./sideCart";
import SearchDialog from "./searchDialog";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";
import { useWishlist } from "@/contexts/WishlistContext";

function Header({
  className,
  profilePic,
}: {
  className?: string;
  profilePic?: string;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [avatar, setAvatar] = useState<string>(profilePic || "");
  const [avatarBgColor, setAvatarBgColor] = useState<string>("");
  const pathName = usePathname();
  const { wishlistItems } = useWishlist();

  const navigationLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const generateRandomColor = () => {
    const colors = [
      "#FF6B6B", // Red
      "#4ECDC4", // Teal
      "#45B7D1", // Blue
      "#FFA07A", // Light Salmon
      "#98D8C8", // Mint
      "#F7DC6F", // Yellow
      "#BB8FCE", // Purple
      "#85C1E2", // Sky Blue
      "#F8B739", // Orange
      "#52B788", // Green
      "#E63946", // Crimson
      "#457B9D", // Steel Blue
      "#F77F00", // Dark Orange
      "#06A77D", // Sea Green
      "#C9184A", // Rose
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return "U";

    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return words[0].charAt(0).toUpperCase();
  };

  useEffect(() => {
    setAvatarBgColor(generateRandomColor());
  }, []);

  useEffect(() => {
    (async () => {
      if (sessionStatus === "authenticated" && !profilePic) {
        try {
          const res = await fetch("/api/users");
          if (res.ok) {
            const data = await res.json();
            setAvatar(data.user.image || "");
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      } else if (sessionStatus === "authenticated" && profilePic) {
        setAvatar(profilePic);
      }
    })();
  }, [sessionStatus, profilePic]);

  return (
    <header
      className={cn(
        "min-h-14 md:min-h-[100px] px-6 flex items-center",
        className,
      )}
    >
      <div className="max-w-[1440px] mx-auto flex justify-end md:justify-between items-center grow">
        <div className="hidden md:block"></div>
        <div className="hidden md:flex justify-between items-center font-medium gap-[75px]">
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "hover:text-[#FF5714] transition-colors duration-200",
                link.href === "/"
                  ? pathName === "/" && "text-[#FF5714]"
                  : pathName.startsWith(link.href) && "text-[#FF5714]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex justify-between items-center gap-7">
          {sessionStatus === "loading" ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="focus:outline-none">
                {sessionStatus === "authenticated" ? (
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatar} alt={session.user.name || ""} />
                    <AvatarFallback
                      style={{ backgroundColor: avatarBgColor }}
                      className="text-white font-semibold"
                    >
                      {getUserInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User
                    size={24}
                    strokeWidth={2}
                    className="hover:scale-110 transition-transform duration-200"
                  />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl p-2 min-w-[240px] z-[998] bg-white/80 backdrop-blur-md border border-gray-100 shadow-xl"
              >
                {sessionStatus === "authenticated" ? (
                  <>
                    <div className="px-3 py-4 flex items-center gap-3 border-b border-gray-100 mb-2">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                        <AvatarImage
                          src={avatar}
                          alt={session.user.name || ""}
                        />
                        <AvatarFallback
                          style={{ backgroundColor: avatarBgColor }}
                          className="text-white font-semibold text-xs"
                        >
                          {getUserInitials(session.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                          {session.user.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
                          {session.user.email}
                        </p>
                      </div>
                    </div>

                    {session.user.role === "admin" && (
                      <Link href={"/admin"}>
                        <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#FF5714]/10 hover:text-[#FF5714] transition-all rounded-lg mb-1 group">
                          <LockKeyhole
                            size={18}
                            className="mr-2 group-hover:scale-110 transition-transform"
                          />
                          Admin Panel
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <Link href={"/account"}>
                      <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#FF5714]/10 hover:text-[#FF5714] transition-all rounded-lg mb-1 group">
                        <UserPen
                          size={18}
                          className="mr-2 group-hover:scale-110 transition-transform"
                        />
                        My Account
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                    <DropdownMenuItem
                      className="px-3 py-2.5 cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 transition-all rounded-lg group"
                      onClick={() => signOut()}
                    >
                      <LogOut
                        size={18}
                        className="mr-2 group-hover:translate-x-1 transition-transform"
                      />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="p-3 mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                        Welcome
                      </p>
                      <p className="text-sm text-gray-600 px-1">
                        Sign in to manage your orders and profile.
                      </p>
                    </div>
                    <Link href="/account">
                      <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-sm font-medium text-gray-700 hover:bg-[#FF5714]/10 hover:text-[#FF5714] transition-all rounded-lg mb-1 group">
                        <LogIn
                          size={18}
                          className="mr-2 group-hover:translate-x-1 transition-transform"
                        />
                        Login
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/account">
                      <DropdownMenuItem className="px-3 py-2.5 cursor-pointer text-sm font-medium text-[#FF5714] bg-[#FF5714]/5 hover:bg-[#FF5714]/10 transition-all rounded-lg group">
                        <UserPlus
                          size={18}
                          className="mr-2 group-hover:scale-110 transition-transform"
                        />
                        Create Account
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <SearchDialog />
          <Link href="/wishlist" className="relative group">
            <CiHeart
              stroke="#000"
              size={24}
              strokeWidth={1}
              className="hover:scale-110 transition-transform duration-200 cursor-pointer"
            />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FF5714] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <SideCart />
        </div>
        <div className="md:hidden flex item-center">
          <MobileHeaderSideMenu
            avatar={avatar}
            avatarBgColor={avatarBgColor}
            getUserInitials={getUserInitials}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
