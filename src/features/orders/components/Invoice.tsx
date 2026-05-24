import React from "react";
import { IOrder } from "@/models/order";
import { format } from "date-fns";

interface InvoiceProps {
  order: IOrder;
}

const Invoice: React.FC<InvoiceProps> = ({ order }) => {
  return (
    <div className="hidden print:block bg-white text-black p-12 max-w-5xl mx-auto min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <div className="flex items-center gap-2 mb-6">
            {/* Simulating a Logo Icon */}
            <div className="w-10 h-10 bg-[#FF5714] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              F
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Furniro.
            </h1>
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            <p className="font-medium text-gray-900">Furniro Inc.</p>
            <p>400 University Drive Suite 200</p>
            <p>Coral Gables, FL 33134, USA</p>
            <p>support@furniro.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-6xl font-extralight text-gray-100 tracking-widest uppercase mb-4">
            Invoice
          </h2>
          <div className="inline-block text-left bg-gray-50 rounded-xl p-6 border border-gray-100 min-w-[240px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Invoice No
              </span>
              <span className="font-mono font-bold text-gray-900">
                #{order._id.toString().slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                Date
              </span>
              <span className="font-medium text-gray-900">
                {format(new Date(order.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-12 mb-16 border-t border-b border-gray-50 py-10">
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-[#FF5714] mb-4">
            Bill To
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {order.shippingAddress.fullName}
          </h3>
          <div className="text-gray-600 text-sm leading-relaxed">
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && (
              <p>{order.shippingAddress.line2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="mt-2 text-gray-400">
                {order.shippingAddress.phone}
              </p>
            )}
          </div>
        </div>
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Payment Details
          </span>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm text-gray-500">Payment Method</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {order.payment?.provider || "Cash on Delivery"}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm text-gray-500">Payment Status</span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                  order.payment?.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.payment?.status || "Pending"}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="text-sm font-mono text-gray-400">
                {order._id.toString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-900">
                Item Details
              </th>
              <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-900">
                Price
              </th>
              <th className="text-center py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-900">
                Qty
              </th>
              <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-900">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item, index) => (
              <tr key={index} className="group">
                <td className="py-5 px-4">
                  <p className="font-bold text-gray-900 text-base mb-1">
                    {item.title}
                  </p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    {item.color && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        Color:{" "}
                        <span className="font-medium text-gray-700">
                          {item.color}
                        </span>
                      </span>
                    )}
                    {item.size && (
                      <span className="inline-flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        Size:{" "}
                        <span className="font-medium text-gray-700">
                          {item.size}
                        </span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-5 px-4 text-right align-top">
                  <span className="text-gray-600 font-medium">
                    ${item.unitPrice.toFixed(2)}
                  </span>
                </td>
                <td className="py-5 px-4 text-center align-top">
                  <span className="text-gray-900 font-bold bg-gray-50 px-3 py-1 rounded-lg">
                    {item.quantity}
                  </span>
                </td>
                <td className="py-5 px-4 text-right align-top">
                  <span className="text-gray-900 font-bold">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end mb-20">
        <div className="w-96 bg-gray-50 p-8 rounded-2xl border border-gray-100">
          <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-900 font-bold">
                ${order.subTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Shipping</span>
              <span className="text-gray-900 font-bold">
                {order.shipping === 0
                  ? "Free"
                  : `$${order.shipping.toFixed(2)}`}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Estimated Tax</span>
                <span className="text-gray-900 font-bold">
                  ${order.tax.toFixed(2)}
                </span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-[#FF5714]">
                <span className="font-medium">Discount</span>
                <span className="font-bold">-${order.discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Due</span>
            <span className="text-2xl font-bold text-[#FF5714]">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-4 border-[#FF5714]/10 pt-8 pb-4">
        <div className="flex justify-between items-end">
          <div className="text-sm text-gray-500">
            <p className="font-bold text-gray-900 mb-2">
              Thank you for your business!
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-gray-400">
              Please note that this is a system generated invoice and signature
              is not required. For any questions, reach out to our support team.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#FF5714] font-bold text-lg mb-1">Furniro.</p>
            <p className="text-xs text-gray-400">www.furniro.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
