"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - Styled more cleanly */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 bg-gray-900/90 backdrop-blur-md text-white rounded-xl shadow-lg border border-gray-800 active:scale-95 transition-all"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar - Glassmorphism overhaul */}
      <aside
        className={`
          fixed lg:sticky top-0 inset-y-0 left-0 z-40
          w-64 bg-gray-900/95 lg:bg-gray-900 backdrop-blur-xl text-white
          transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          border-r border-gray-800/50
          ${
            isMobileMenuOpen
              ? "translate-x-0 shadow-2xl"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section - Premium look */}
          <div className="p-8 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                  Store Admin
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">
                  Control Panel
                </p>
              </div>
            </div>
          </div>

          {/* Navigation - Better spacing and active states */}
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                    transition-all duration-300 ease-out
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }
                  `}
                >
                  {/* Active Indicator Pillar */}
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  )}

                  <Icon
                    size={20}
                    className={`transition-colors duration-300 ${
                      isActive ? "text-blue-500" : "group-hover:text-blue-400"
                    }`}
                  />
                  <span className="font-semibold text-sm tracking-wide">
                    {item.label}
                  </span>

                  {/* Hover micro-indicator */}
                  {!isActive && (
                    <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Social/System Status look */}
          <div className="p-6 border-t border-gray-800/50 bg-black/20">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
            >
              <div className="p-1.5 rounded-lg bg-gray-800 group-hover:bg-blue-600/20 transition-colors">
                <Menu
                  size={16}
                  className="rotate-90 group-hover:text-blue-400"
                />
              </div>
              <span className="text-sm font-medium">View Live Store</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Modern Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
