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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
