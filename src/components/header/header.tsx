"use client";
import React, { useState, useEffect } from "react";
import { TbUserExclamation } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { LockKeyhole, LogIn, UserPen, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileHeaderSideMenu from "./mobileHeaderSideMenu";
import SideCart from "./sideCart";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

function Header({ className, profilePic }: { className?: string; profilePic?: string }) {
  const { data: session, status: sessionStatus } = useSession();
  const [avatar, setAvatar] = useState<string>(profilePic || "");
  const [avatarBgColor, setAvatarBgColor] = useState<string>("");

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
        setAvatar(profilePic)
      }
    })();
  }, [sessionStatus, profilePic]);

  console.log("Session in Header:", session);
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
          {sessionStatus === "loading" ? (
            <Skeleton className="w-10 h-10 rounded-full"/>
          ) : (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="focus:outline-none">
                {sessionStatus === "authenticated" ? (
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={avatar}
                      alt={session.user.name || ""}
                    />
                    <AvatarFallback
                      style={{ backgroundColor: avatarBgColor }}
                      className="text-white font-semibold"
                    >
                      {getUserInitials(session.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <TbUserExclamation size={24} strokeWidth={2} />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-md p-0 min-w-[200px]"
              >
                {sessionStatus === "authenticated" ? (
                  <>
                    <DropdownMenuLabel asChild>My Account</DropdownMenuLabel>
                    {session.user.role === "admin" && (
                      <Link href={"/admin"}>
                        <DropdownMenuItem className="px-4 py-3 cursor-pointer text-base hover:bg-[#FAF4F4]">
                          Admin Panel
                          <DropdownMenuShortcut>
                            <LockKeyhole size={16} />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <Link href={"/account"}>
                      <DropdownMenuItem className="px-4 py-3 cursor-pointer text-base hover:bg-[#FAF4F4]">
                        My Account
                        <DropdownMenuShortcut>
                          <UserPen size={16} />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                      className="px-4 py-3 cursor-pointer text-base hover:bg-[#FAF4F4]"
                      onClick={() => signOut()}
                    >
                      Logout
                      <DropdownMenuShortcut>
                        <LogOut size={16} />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <Link href="/account">
                      <DropdownMenuItem className="px-4 py-3 cursor-pointer text-base hover:bg-[#FAF4F4]">
                        Register
                        <DropdownMenuShortcut>
                          <UserPlus size={16} />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/account">
                      <DropdownMenuItem className="px-4 py-3 cursor-pointer text-base hover:bg-[#FAF4F4]">
                        Login
                        <DropdownMenuShortcut>
                          <LogIn size={16} />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <CiSearch stroke="#000" size={24} strokeWidth={1} />
          <CiHeart stroke="#000" size={24} strokeWidth={1} />
          <SideCart />
        </div>
        <div className="md:hidden flex item-center">
          <MobileHeaderSideMenu avatar={avatar} avatarBgColor={avatarBgColor} getUserInitials={getUserInitials} />
        </div>
      </div>
    </header>
  );
}

export default Header;
