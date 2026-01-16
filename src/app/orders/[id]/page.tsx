"use client";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Calendar,
  ShoppingBag,
  Loader2,
  Printer,
  Download,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/header/header";
import Footer from "@/components/footer";
import PageTitle from "@/components/pageTitle";
import TrackOrder from "@/components/orders/TrackOrder";
import Invoice from "@/components/orders/Invoice";
import { IOrder } from "@/models/order";
import { format } from "date-fns";
import Image from "next/image";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { status: sessionStatus } = useSession();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (sessionStatus === "authenticated") {
        try {
          const res = await fetch(`/api/orders/${id}`);
          if (!res.ok) throw new Error("Order not found");
          const data = await res.json();
          setOrder(data.order);
        } catch (err) {
          setError(
            "Failed to load order details. It might have been deleted or moved."
          );
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else if (sessionStatus === "unauthenticated") {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, sessionStatus]);

  const handlePrint = () => {
    window.print();
  };

  if (sessionStatus === "unauthenticated") {
    return (
      <>
        <Header />
        <PageTitle
          title="Order Details"
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
              You need to be logged in to view your order details.
            </p>
            <Link
              href="/account"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FF5714] text-white rounded-2xl font-medium hover:bg-[#e44d12] transition-all"
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
      <div className="print:hidden">
        <Header />
        <PageTitle
          title="Order Details"
          backgroundImageUrl="/images/pageTitleBg.jpg"
          logoImageUrl="/images/pageTitleLogo.png"
        />

        <main className="min-h-screen bg-[#F9F1E7]/30 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Top Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-[#FF5714] font-medium transition-colors group"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-[#FF5714]/10 transition-colors">
                  <ArrowLeft size={16} />
                </div>
                Back to My Orders
              </Link>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-100 text-gray-600 transition-all flex items-center gap-2 font-medium text-sm"
                >
                  <Printer size={16} />
                  Print Order
                </button>
                <button
                  onClick={handlePrint}
                  className="p-3 bg-white hover:bg-gray-50 rounded-xl shadow-sm border border-gray-100 text-gray-600 transition-all flex items-center gap-2 font-medium text-sm"
                >
                  <Download size={16} />
                  Invoice
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin h-12 w-12 text-[#FF5714]" />
                <p className="mt-4 text-gray-500 font-medium">
                  Loading order details...
                </p>
              </div>
            ) : error || !order ? (
              <div className="bg-red-50 border border-red-100 rounded-[40px] p-12 text-center shadow-md">
                <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Order Not Found
                </h2>
                <p className="text-gray-500 mb-8">
                  {error || "The order you're looking for doesn't exist."}
                </p>
                <Link
                  href="/orders"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-black transition-all"
                >
                  Return to Orders
                </Link>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Order Tracking Header Card */}
                <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-10 border-b border-gray-100">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#F9F1E7] rounded-2xl text-[#FF5714]">
                          <Package size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Order #
                            {order._id.toString().slice(-8).toUpperCase()}
                          </h2>
                          <div className="flex items-center gap-2 mt-1 text-gray-500 font-medium">
                            <Calendar size={16} />
                            <span>
                              Placed on{" "}
                              {format(
                                new Date(order.createdAt),
                                "MMMM d, yyyy 'at' h:mm a"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                        Order Total
                      </p>
                      <p className="text-4xl font-bold text-[#FF5714]">
                        ${order.total.toFixed(2)}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                        <CreditCard size={14} />
                        {order.payment?.provider || "Cash on Delivery"}
                      </div>
                    </div>
                  </div>

                  <div className="max-w-3xl mx-auto">
                    <h3 className="text-center font-medium text-gray-400 uppercase tracking-widest text-xs mb-10">
                      Order Tracking
                    </h3>
                    <TrackOrder status={order.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Items Side */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-sm border border-white">
                      <h3 className="text-xl font-semibold text-gray-900 mb-8 flex items-center gap-2">
                        <ShoppingBag size={22} className="text-[#FF5714]" />
                        Items Detailed
                      </h3>
                      <div className="space-y-6">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-6 group">
                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package
                                    size={32}
                                    className="text-gray-300"
                                  />
                                </div>
                              )}
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-gray-100">
                                x{item.quantity}
                              </div>
                            </div>

                            <div className="flex flex-col justify-between py-1 flex-grow">
                              <div>
                                <h4 className="font-semibold text-lg text-gray-900 group-hover:text-[#FF5714] transition-colors line-clamp-1">
                                  {item.title}
                                </h4>
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {item.color && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 border border-gray-100">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            item.color.toLowerCase(),
                                        }}
                                      ></div>
                                      {item.color}
                                    </span>
                                  )}
                                  {item.size && (
                                    <span className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 border border-gray-100 uppercase">
                                      Size: {item.size}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-end justify-between">
                                <p className="text-sm font-medium text-gray-400">
                                  Unit Price: ${item.unitPrice.toFixed(2)}
                                </p>
                                <p className="text-xl font-bold text-gray-900">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-10 pt-10 border-t border-gray-100 space-y-3">
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Subtotal</span>
                          <span>${order.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Shipping</span>
                          <span>
                            {order.shipping === 0
                              ? "Free"
                              : `$${order.shipping.toFixed(2)}`}
                          </span>
                        </div>
                        {order.tax > 0 && (
                          <div className="flex justify-between text-gray-500 font-medium">
                            <span>Tax</span>
                            <span>${order.tax.toFixed(2)}</span>
                          </div>
                        )}
                        {order.discount > 0 && (
                          <div className="flex justify-between text-red-500 font-medium">
                            <span>Discount</span>
                            <span>-${order.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3">
                          <span>Total</span>
                          <span className="text-[#FF5714]">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Side */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-white">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <MapPin size={22} className="text-[#FF5714]" />
                        Shipping Address
                      </h3>
                      <div className="space-y-4">
                        <p className="font-semibold text-gray-900">
                          {order.shippingAddress.fullName}
                        </p>
                        <div className="text-gray-500 font-medium text-sm leading-relaxed">
                          <p>{order.shippingAddress.line1}</p>
                          {order.shippingAddress.line2 && (
                            <p>{order.shippingAddress.line2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state &&
                              `${order.shippingAddress.state} `}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-50">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                            Phone Number
                          </p>
                          <p className="font-semibold text-gray-800">
                            {order.shippingAddress.phone || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-white">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard size={22} className="text-[#FF5714]" />
                        Payment Info
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                            Method
                          </p>
                          <p className="font-semibold text-gray-800">
                            {order.payment?.provider || "Cash on Delivery"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                            Status
                          </p>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                              order.payment?.status === "paid"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}
                          >
                            {order.payment?.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-[40px] p-8 shadow-xl text-white overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                      <h3 className="text-xl font-semibold mb-4 relative z-10">
                        Need Help?
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 relative z-10 leading-relaxed">
                        If you have any questions regarding your order, our
                        dedicated support team is here to help 24/7.
                      </p>
                      <Link
                        href="/contact"
                        className="inline-flex w-full items-center justify-center py-3 bg-white text-black rounded-2xl font-medium hover:bg-[#FF5714] hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] relative z-10"
                      >
                        Contact Support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
      {order && <Invoice order={order} />}
    </>
  );
}
