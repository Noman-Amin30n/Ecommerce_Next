"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/admin/StatsCard";
import StatusBadge from "@/components/admin/StatusBadge";
import SalesChart from "@/components/admin/charts/SalesChart";
import UsersChart from "@/components/admin/charts/UsersChart";
import RevenueChart from "@/components/admin/charts/RevenueChart";
import OrdersChart from "@/components/admin/charts/OrdersChart";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { OrderStatus } from "@/models/order";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  publishedProducts: number;
  totalRevenue: number;
  statusBreakdown: Record<string, number>;
}

interface RecentOrder {
  _id: string;
  user?: {
    name?: string;
    email: string;
  };
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">
            Syncing dashboard data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Welcome back! Here&apos;s what&apos;s happening with your store
            today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-xs font-bold text-gray-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Metrics
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
        />
        <StatsCard
          title="Total Revenue"
          value={`PKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      {/* Analytics Charts Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Analytics Overview
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Comprehensive insights into sales, users, revenue, and orders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart />
          <UsersChart />
          <RevenueChart />
          <OrdersChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders - Taking more space */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Recent Activity
            </h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
              View All Orders
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Order
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-black text-gray-400 text-right">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Package size={32} strokeWidth={1.5} />
                          <p className="text-sm font-medium">
                            No recent orders found
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-bold text-gray-900">
                            #{order._id.slice(-8).toUpperCase()}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {order.user?.name || "Guest User"}
                          </div>
                          <p className="text-[10px] text-gray-400 lowercase">
                            {order.user?.email || "No email provided"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-bold text-gray-900">
                            PKR {order.total.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown - Sidebar style */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Status Insight
          </h2>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
            <div className="space-y-4">
              {[
                "pending",
                "paid",
                "shipped",
                "delivered",
                "cancelled",
                "refunded",
              ].map((status) => {
                const count = stats?.statusBreakdown[status] || 0;
                const total = stats?.totalOrders || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            status === "delivered"
                              ? "bg-emerald-500"
                              : status === "shipped"
                                ? "bg-blue-500"
                                : status === "paid"
                                  ? "bg-indigo-500"
                                  : status === "pending"
                                    ? "bg-orange-500"
                                    : "bg-gray-400"
                          }`}
                        />
                        <span className="text-xs font-bold text-gray-600 capitalize">
                          {status}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-gray-400">
                        {count} Orders
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          status === "delivered"
                            ? "bg-emerald-500"
                            : status === "shipped"
                              ? "bg-blue-500"
                              : status === "paid"
                                ? "bg-indigo-500"
                                : status === "pending"
                                  ? "bg-orange-500"
                                  : "bg-gray-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                Data refreshed every hour
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
