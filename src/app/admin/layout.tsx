// src/app/admin/layout.tsx
import { ReactNode } from "react";
import Sidebar from "@/components/admin/Sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your e-commerce store",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Glassmorphism */}
        <header className="sticky top-0 z-20 h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10 h-10" />{" "}
            {/* Spacer for mobile menu button */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">
                Admin
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-bold">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200/50">
              System Online
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border-2 border-white shadow-sm" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          <div className="relative">
            {/* Subtle background decoration */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
