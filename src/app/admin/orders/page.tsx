"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { OrderStatus } from "@/models/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  _id: string;
  user?: {
    name?: string;
    email: string;
  };
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Order Management
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Monitor and manage your customer transactions.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-8 relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by Order ID or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200">
                <SelectItem value="all" className="font-medium">
                  All Transactions
                </SelectItem>
                <SelectItem value="pending" className="font-medium">
                  Pending
                </SelectItem>
                <SelectItem
                  value="paid"
                  className="font-medium text-emerald-600"
                >
                  Paid
                </SelectItem>
                <SelectItem
                  value="shipped"
                  className="font-medium text-blue-600"
                >
                  Shipped
                </SelectItem>
                <SelectItem
                  value="delivered"
                  className="font-medium text-indigo-600"
                >
                  Delivered
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className="font-medium text-red-600"
                >
                  Cancelled
                </SelectItem>
                <SelectItem
                  value="refunded"
                  className="font-medium text-gray-600"
                >
                  Refunded
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Transaction
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Customer
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Revenue
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                  Current Status
                </th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-gray-400">
                        Syncing orders...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                        <ShoppingBag size={32} />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold">
                          No orders found
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Try adjusting your filters or search query.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-blue-50/30 transition-all group cursor-default"
                  >
                    <td className="px-6 py-5">
                      <div className="font-mono text-xs font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-gray-900">
                        {order.user?.name || "Guest Checkout"}
                      </div>
                      <p className="text-[10px] text-gray-400 lowercase truncate max-w-[150px]">
                        {order.user?.email || "No email provided"}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">
                        PKR {order.total.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                        >
                          <Eye size={16} />
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium font-mono">
              PAGE {page} OF {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
