"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Package,
  ChevronRight,
  AlertCircle,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import PageTitle from "@/components/pageTitle";
import { IOrder } from "@/models/order";
import { format } from "date-fns";
import Image from "next/image";

const OrderStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    paid: "bg-blue-100 text-blue-700 border-blue-200",
    shipped: "bg-indigo-100 text-indigo-700 border-indigo-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    refunded: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        styles[status] || styles.pending
      } capitalize`}
    >
      {status}
    </span>
  );
};

export default function OrdersPage() {
  const { status: sessionStatus } = useSession();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (sessionStatus === "authenticated") {
        try {
          const res = await fetch("/api/orders");
          if (!res.ok) throw new Error("Failed to fetch orders");
          const data = await res.json();
          setOrders(data.orders || []);
        } catch (err) {
          setError("Could not load your orders. Please try again later.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else if (sessionStatus === "unauthenticated") {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [sessionStatus]);

  if (sessionStatus === "unauthenticated") {
    return (
      <>
        <Header />
        <PageTitle
          title="My Orders"
          backgroundImageUrl="/images/pageTitleBg.jpg"
          logoImageUrl="/images/pageTitleLogo.png"
        />
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-[#F9F1E7]/30">
          <div className="bg-white p-10 rounded-[40px] shadow-xl text-center max-w-md border border-white/50 backdrop-blur-sm">
            <div className="bg-[#FF5714]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-[#FF5714]" />
            </div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Please Sign In
            </h2>
            <p className="text-gray-500 mb-8 font-medium">
              You need to be logged in to view your order history and track your
              packages.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FF5714] text-white rounded-2xl font-medium hover:bg-[#e44d12] transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-[#FF5714]/20"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <PageTitle
        title="My Orders"
        backgroundImageUrl="/images/pageTitleBg.jpg"
        logoImageUrl="/images/pageTitleLogo.png"
      />

      <main className="min-h-screen bg-[#F9F1E7]/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back to Account Link */}
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF5714] font-semibold mb-8 transition-colors group"
          >
            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-[#FF5714]/10 transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Account
          </Link>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <Loader2 className="animate-spin h-12 w-12 text-[#FF5714]" />
                <div className="absolute inset-0 blur-xl bg-[#FF5714]/20 rounded-full animate-pulse"></div>
              </div>
              <p className="mt-4 text-gray-500 font-medium">
                Loading your orders...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[40px] p-12 text-center shadow-md border border-white/50">
              <div className="bg-[#F9F1E7] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-[#FF5714]" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No orders found
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Looks like you haven&appo;t placed any orders yet. Start
                shopping to fill this space!
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#FF5714] text-white rounded-2xl font-medium hover:bg-[#e44d12] transition-all transform hover:scale-105 active:scale-95"
              >
                Go to Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Orders ({orders.length})
                </h3>
              </div>

              <div className="grid gap-6">
                {orders.map((order) => (
                  <div
                    key={order._id.toString()}
                    className="group bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-white hover:border-[#FF5714]/30 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-[#F9F1E7] rounded-2xl text-[#FF5714]">
                          <Package size={28} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Order ID
                          </p>
                          <h4 className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-none">
                            #{order._id.toString().slice(-8).toUpperCase()}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Placed on{" "}
                            {format(new Date(order.createdAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Total
                          </p>
                          <p className="text-lg font-semibold text-[#FF5714]">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Status
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>

                        <div className="col-span-2 md:col-span-1 flex justify-end">
                          <Link
                            href={`/orders/${order._id}`}
                            className="bg-gray-50 hover:bg-[#FF5714] text-gray-800 hover:text-white px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 group/btn border border-gray-100"
                          >
                            Details
                            <ChevronRight
                              size={18}
                              className="transform group-hover/btn:translate-x-1 transition-transform"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Items Preview */}
                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100 relative"
                          >
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-400">
                        {order.items.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        )}{" "}
                        items in this order
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
