"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { OrderStatus } from "@/models/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  product: {
    _id: string;
    title: string;
    images: string[];
  };
  title: string;
  image: string;
  variantSku?: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface Order {
  _id: string;
  user?: {
    name?: string;
    email: string;
  };
  items: OrderItem[];
  subTotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  payment?: {
    provider: string;
    providerId?: string;
    status?: string;
  };
  createdAt: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus: OrderStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrder();
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">Order not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Package size={20} />
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="p-6 flex gap-4">
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.product?.images?.[0] && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    {item.variantSku && (
                      <p className="text-sm text-gray-500">
                        SKU: {item.variantSku}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      PKR {item.unitPrice.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      PKR {item.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  PKR {order.subTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  PKR {order.shipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  PKR {order.tax.toLocaleString()}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -PKR {order.discount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>PKR {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p>{order.shippingAddress.line2}</p>
              )}
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.state &&
                  `, ${order.shippingAddress.state}`}
              </p>
              <p>{order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p>Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer
            </h2>
            <div className="text-gray-700 space-y-1">
              {order.user?.name && (
                <p className="font-medium">{order.user.name}</p>
              )}
              <p className="text-sm">{order.user?.email || "Guest"}</p>
            </div>
          </div>

          {/* Payment Info */}
          {order.payment && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment
              </h2>
              <div className="text-gray-700 space-y-1">
                <p>
                  <span className="text-gray-600">Provider:</span>{" "}
                  {order.payment.provider}
                </p>
                {order.payment.providerId && (
                  <p className="text-sm text-gray-500">
                    ID: {order.payment.providerId}
                  </p>
                )}
                {order.payment.status && (
                  <p>
                    <span className="text-gray-600">Status:</span>{" "}
                    {order.payment.status}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Update Status
            </h2>
            <Select
              value={order.status}
              onValueChange={(value) => updateStatus(value as OrderStatus)}
              disabled={updating}
            >
              <SelectTrigger className="w-full focus:border-blue-500 focus:shadow-sm transition-all">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
